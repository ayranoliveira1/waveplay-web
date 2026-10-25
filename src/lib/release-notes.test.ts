import { describe, expect, it } from 'vitest'
import { parseReleaseNotes } from './release-notes'

const NOTES_1_1_1 =
  'Atualização do WavePlay 1.1.1!\n\nTrazemos novidades para deixar sua experiência ainda\nmelhor. Agora assistir séries ficou mais fácil:\no próximo episódio começa sozinho e você troca de\nepisódio sem sair do player.\n\nDestaques desta versão:\n- Próximo episódio automático, com contagem no fim\ne as opções Cancelar e Assistir agora\n- O próximo episódio já abre na mesma fonte que você\nescolheu e começa a tocar sozinho\n- Painel de episódios dentro do player, para trocar\nde temporada e de episódio sem sair\n- Botão Fontes para trocar de áudio ou de servidor no\nmeio do episódio, continuando do mesmo ponto\n- Continuar Assistindo mais preciso, voltando\nexatamente de onde você parou\n- Player mais estável, que recarrega sozinho quando o\nservidor demora para responder\n\nContinue aproveitando o melhor do streaming com a\ngente. Bom filme!'

describe('parseReleaseNotes', () => {
  it('parses 1.1.1 notes', () => {
    expect(parseReleaseNotes(NOTES_1_1_1)).toEqual([
      { kind: 'title', text: 'Atualização do WavePlay 1.1.1!' },
      {
        kind: 'paragraph',
        text: expect.stringMatching(
          /^Trazemos novidades para deixar sua experiência ainda melhor\. Agora assistir séries ficou mais fácil: o próximo episódio/,
        ),
      },
      { kind: 'heading', text: 'Destaques desta versão:' },
      {
        kind: 'list',
        items: [
          'Próximo episódio automático, com contagem no fim e as opções Cancelar e Assistir agora',
          ...Array(5).fill(expect.any(String)),
        ],
      },
      {
        kind: 'paragraph',
        text: 'Continue aproveitando o melhor do streaming com a gente. Bom filme!',
      },
    ])
  })

  it('free text becomes paragraphs', () => {
    expect(parseReleaseNotes('linha um\nlinha dois\n\noutro')).toEqual([
      { kind: 'paragraph', text: 'linha um linha dois' },
      { kind: 'paragraph', text: 'outro' },
    ])
  })

  it('handles CRLF', () => {
    expect(parseReleaseNotes(NOTES_1_1_1.replace(/\n/g, '\r\n'))).toEqual(
      parseReleaseNotes(NOTES_1_1_1),
    )
  })

  it('blank returns empty', () => {
    expect(parseReleaseNotes('  \n \n')).toEqual([])
  })
})
