import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { FileUp, ChevronLeft, AlertCircle } from 'lucide-react'
import { admin } from '../../../services/admin'
import { Modal } from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { toast } from '../../../lib/toast'

// Aceita X.Y.Z e X.Y.Z-prerelease (alinhado com backend Task 31)
const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/
const APK_CONTENT_TYPE = 'application/vnd.android.package-archive'
const MAX_SIZE_MB = 200

const metadataSchema = z.object({
  version: z
    .string()
    .regex(SEMVER_REGEX, 'Formato semver invalido (ex: 1.0.3 ou 1.0.3-beta.1)'),
  releaseNotes: z.string().max(2000).optional(),
  forceUpdate: z.boolean().optional(),
})

type MetadataFormData = z.infer<typeof metadataSchema>

type Step = 'select-file' | 'metadata' | 'uploading' | 'finalizing'

interface CreateAppVersionModalProps {
  open: boolean
  onClose: () => void
}

export function CreateAppVersionModal({
  open,
  onClose,
}: CreateAppVersionModalProps) {
  return open ? <CreateAppVersionInner onClose={onClose} /> : null
}

function CreateAppVersionInner({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const [step, setStep] = useState<Step>('select-file')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [versionError, setVersionError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<MetadataFormData>({
    resolver: zodResolver(metadataSchema),
    defaultValues: { version: '', releaseNotes: '', forceUpdate: false },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    setFileError(null)
    if (!selected) {
      setFile(null)
      return
    }
    if (!selected.name.toLowerCase().endsWith('.apk')) {
      setFileError('Selecione um arquivo .apk')
      setFile(null)
      return
    }
    const sizeMb = selected.size / 1024 / 1024
    if (sizeMb > MAX_SIZE_MB) {
      setFileError(`Tamanho maximo: ${MAX_SIZE_MB} MB (atual: ${sizeMb.toFixed(1)} MB)`)
      setFile(null)
      return
    }
    setFile(selected)
  }

  const finalizeMutation = useMutation({
    mutationFn: async (params: {
      data: MetadataFormData
      storageKey: string
    }) => {
      const response = await admin.createAppVersion({
        version: params.data.version,
        storageKey: params.storageKey,
        fileSize: file!.size,
        releaseNotes: params.data.releaseNotes || undefined,
        forceUpdate: params.data.forceUpdate ?? false,
      })
      if (!response.success) {
        const msg = response.error?.[0]?.message ?? 'Falha ao registrar versao'
        const code = response.error?.[0]?.code
        throw Object.assign(new Error(msg), { code })
      }
      return response.data
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'app-versions'] })
      toast.success(`Versao ${vars.data.version} publicada`)
      onClose()
    },
    onError: (error: Error & { code?: string }) => {
      if (error.code === 'VERSION_ALREADY_EXISTS') {
        setVersionError(error.message)
        setError('version', { message: error.message })
      } else {
        toast.error(error.message ?? 'Falha ao registrar versao')
      }
      setStep('metadata')
    },
  })

  async function onSubmitMetadata(data: MetadataFormData) {
    if (!file) return
    setVersionError(null)
    setStep('uploading')
    setProgress(0)

    // 1. Pega presigned URL
    const presignedResponse = await admin.generateAppVersionUploadUrl({
      version: data.version,
    })
    if (!presignedResponse.success) {
      const msg =
        presignedResponse.error?.[0]?.message ?? 'Falha ao gerar URL de upload'
      const code = presignedResponse.error?.[0]?.code
      if (code === 'VERSION_ALREADY_EXISTS') {
        setVersionError(msg)
        setError('version', { message: msg })
      } else {
        toast.error(msg)
      }
      setStep('metadata')
      return
    }

    const { uploadUrl, storageKey } = presignedResponse.data

    // 2. Upload via XHR (com progress)
    try {
      await uploadFile(uploadUrl, file, (pct) => setProgress(pct), xhrRef)
    } catch (err) {
      const message = (err as Error).message
      if (message !== 'aborted') {
        toast.error(`Falha no upload: ${message}`)
      }
      setStep('metadata')
      return
    }

    // 3. Registra metadata
    setStep('finalizing')
    finalizeMutation.mutate({ data, storageKey })
  }

  function handleClose() {
    if (step === 'uploading') {
      xhrRef.current?.abort()
      xhrRef.current = null
      toast.error('Upload cancelado')
    }
    if (step !== 'finalizing') {
      onClose()
    }
  }

  function handleBackToSelectFile() {
    setStep('select-file')
  }

  function handleBackToMetadata() {
    setStep('metadata')
  }

  return (
    <Modal open onClose={handleClose} title="Nova versao do app">
      {step === 'select-file' && (
        <div className="space-y-4">
          <label
            htmlFor="apk-input"
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface/30 p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
          >
            <FileUp size={32} className="text-text-muted" />
            <div>
              <p className="text-sm font-medium text-text">
                {file ? file.name : 'Selecione o arquivo .apk'}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                  : `Maximo ${MAX_SIZE_MB} MB`}
              </p>
            </div>
            <input
              id="apk-input"
              type="file"
              accept=".apk"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          {fileError && (
            <p className="flex items-center gap-2 text-sm text-error">
              <AlertCircle size={16} />
              {fileError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!file}
              onClick={() => setStep('metadata')}
            >
              Proximo
            </Button>
          </div>
        </div>
      )}

      {step === 'metadata' && (
        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmitMetadata)(e)
          }}
          className="space-y-1"
        >
          <Input
            label="Versao (semver)"
            placeholder="1.0.3 ou 1.0.3-beta.1"
            error={versionError ?? errors.version?.message}
            {...register('version')}
          />

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-text-muted">
              Notas da versao (opcional)
            </label>
            <textarea
              {...register('releaseNotes')}
              rows={4}
              placeholder="Bug fixes, novas features..."
              className="block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <label className="mb-5 flex cursor-pointer items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              {...register('forceUpdate')}
              className="h-4 w-4 cursor-pointer accent-primary"
            />
            Forcar atualizacao (modal nao podera ser dispensado no app)
          </label>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBackToSelectFile}
            >
              <ChevronLeft size={16} />
              Voltar
            </Button>
            <Button type="submit">Iniciar upload</Button>
          </div>
        </form>
      )}

      {step === 'uploading' && (
        <div className="space-y-5">
          <div className="text-center">
            <p className="text-sm text-text-muted">
              Enviando APK para o servidor...
            </p>
            <p className="mt-1 text-2xl font-bold text-primary">{progress}%</p>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              fullWidth={false}
              className="px-5"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {step === 'finalizing' && (
        <div className="space-y-5">
          <div className="text-center">
            <p className="text-sm text-text-muted">Finalizando publicacao...</p>
            {finalizeMutation.isError && (
              <Button
                type="button"
                variant="secondary"
                fullWidth={false}
                className="mt-4 px-5"
                onClick={handleBackToMetadata}
              >
                Voltar
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

// Upload via XMLHttpRequest porque fetch nao expoe progress nativo
function uploadFile(
  uploadUrl: string,
  file: File,
  onProgress: (pct: number) => void,
  xhrRef: React.MutableRefObject<XMLHttpRequest | null>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhrRef.current = xhr

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      xhrRef.current = null
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`HTTP ${xhr.status}`))
      }
    }

    xhr.onerror = () => {
      xhrRef.current = null
      reject(new Error('erro de rede'))
    }

    xhr.onabort = () => {
      xhrRef.current = null
      reject(new Error('aborted'))
    }

    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', APK_CONTENT_TYPE)
    xhr.send(file)
  })
}
