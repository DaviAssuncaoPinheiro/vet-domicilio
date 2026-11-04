// Itens mockados da caixa de entrada. Cada trecho (seg) com `f` aponta para o campo extraído.
const T = (t, f) => (f ? { t, f } : { t })

export const CONFIRMED_BASE = 14

export const INBOX = [
  {
    id: 'i1', channel: 'whatsapp', sender: 'Valentina Ruiz', time: 604, unread: true, code: 'EA-51902',
    segs: [T('Hola, ', null), T('buen día', 'lang'), T('. Queremos '), T('3 lugares', 'pax'), T(' para el paseo del '), T('encuentro de las aguas', 'tour'), T(' el '), T('viernes 6', 'date'), T(', somos de Rosario. Nos alojamos en el '), T('Hotel Tropical', 'hotel'), T('. Soy '), T('Valentina Ruiz', 'pax'), T(', mi número es '), T('+54 341 555 0142', 'contact'), T('.')],
    fields: [
      { key: 'tour', label: 'Passeio', value: 'Encontro das Águas', sub: 'Lancha · 4h30' },
      { key: 'date', label: 'Data', value: 'Sex, 6 nov' },
      { key: 'dep', label: 'Saída', value: '08:30', mono: true, sub: 'Lancha Boto', seats: '6 lugares livres', spans: ['date', 'pax'] },
      { key: 'pax', label: 'Passageiros', value: '3 passageiros', names: [{ n: 'Valentina Ruiz', c: 'AR' }], more: 2 },
      { key: 'lang', label: 'Idioma', value: 'Espanhol' },
      { key: 'hotel', label: 'Hotel', value: 'Hotel Tropical' },
      { key: 'contact', label: 'Contato', value: '+54 341 555 0142', mono: true },
    ],
    missing: { label: 'o nome dos acompanhantes', btn: 'Pedir nomes', reply: 'Hola Valentina, para confirmar necesitamos el nombre completo de tus 2 acompañantes. Gracias.' },
  },
  {
    id: 'i2', channel: 'whatsapp', sender: 'Rafael Monteiro', time: 601, unread: true, code: 'EA-51903',
    segs: [T('Oi, tudo bem?', 'lang'), T(' Queria reservar o '), T('pôr do sol', 'tour'), T(' para '), T('amanhã', 'date'), T('. Somos '), T('2 pessoas', 'pax'), T(': eu, '), T('Rafael Monteiro', 'pax'), T(', e a '), T('Juliana Pires', 'pax'), T('. Estamos no '), T('Novotel Manaus', 'hotel'), T('. Pode confirmar neste número '), T('92 99108 0187', 'contact'), T('?')],
    fields: [
      { key: 'tour', label: 'Passeio', value: 'Pôr do sol no Rio Negro', sub: 'Lancha · 2h' },
      { key: 'date', label: 'Data', value: 'Qui, 5 nov' },
      { key: 'dep', label: 'Saída', value: '16:30', mono: true, sub: 'Lancha Tucunaré', seats: '9 lugares livres', spans: ['date', 'pax'] },
      { key: 'pax', label: 'Passageiros', value: '2 passageiros', names: [{ n: 'Rafael Monteiro', c: 'BR' }, { n: 'Juliana Pires', c: 'BR' }] },
      { key: 'lang', label: 'Idioma', value: 'Português' },
      { key: 'hotel', label: 'Hotel', value: 'Novotel Manaus' },
      { key: 'contact', label: 'Contato', value: '92 99108 0187', mono: true },
    ],
  },
  {
    id: 'i3', channel: 'whatsapp', sender: 'Sofía Fernández', time: 592, unread: true, code: 'EA-51904',
    segs: [T('Hola, '), T('confirmo mi reserva', 'lang'), T(' de '), T('hoy', 'date'), T(' para el '), T('encuentro de las aguas', 'tour'), T(' de las 10:30. Somos '), T('Sofía Fernández', 'pax'), T(' y '), T('Mateo González', 'pax'), T(', en el '), T('Juma Ópera', 'hotel'), T('. Escríbanme a '), T('+54 11 5550 0173', 'contact'), T('.')],
    fields: [
      { key: 'tour', label: 'Passeio', value: 'Encontro das Águas', sub: 'Lancha · 4h30' },
      { key: 'date', label: 'Data', value: 'Hoje, 4 nov' },
      { key: 'dep', label: 'Saída', value: '10:30', mono: true, sub: 'Lancha Jaraqui', seats: '0 lugares livres', spans: ['date', 'tour'] },
      { key: 'pax', label: 'Passageiros', value: '2 passageiros', names: [{ n: 'Sofía Fernández', c: 'AR' }, { n: 'Mateo González', c: 'AR' }] },
      { key: 'lang', label: 'Idioma', value: 'Espanhol' },
      { key: 'hotel', label: 'Hotel', value: 'Juma Ópera' },
      { key: 'contact', label: 'Contato', value: '+54 11 5550 0173', mono: true },
    ],
    dup: 'EA-51844',
  },
  {
    id: 'i4', channel: 'agencia', sender: 'Rio Negro Viagens', subject: 'Grupo de 6 para Anavilhanas', time: 580, unread: true, code: 'EA-51905',
    segs: [T('Bom dia, segue a lista do grupo para o '), T('passeio a Anavilhanas', 'tour'), T(' no '), T('sábado, 7 de novembro', 'date'), T('. São '), T('6 passageiros', 'pax'), T(' (planilha anexa), todos falam '), T('alemão', 'lang'), T('. Contato da agência: '), T('reservas@rionegroviagens.com', 'contact'), T('.')],
    sheet: { file: 'grupo_anavilhanas.xlsx', cols: ['Nome', 'País', 'Idioma'], rows: [['Lukas Schneider', 'DE', 'DE'], ['Hannah Weber', 'DE', 'DE'], ['Felix Wagner', 'DE', 'DE'], ['Noah Becker', 'DE', 'DE'], ['Emma Fischer', 'DE', 'EN'], ['Marco Bianchi', 'IT', 'DE']] },
    fields: [
      { key: 'tour', label: 'Passeio', value: 'Arquipélago de Anavilhanas', sub: 'Lancha · 9h30' },
      { key: 'date', label: 'Data', value: 'Sáb, 7 nov' },
      { key: 'dep', label: 'Saída', value: '07:30', mono: true, sub: 'Lancha Pirarucu', seats: '8 lugares livres', spans: ['date', 'pax'] },
      { key: 'pax', label: 'Passageiros', value: '6 passageiros', names: [{ n: 'Lukas Schneider', c: 'DE' }, { n: 'Hannah Weber', c: 'DE' }], more: 4 },
      { key: 'lang', label: 'Idioma', value: 'Alemão' },
      { key: 'hotel', label: 'Hotel', value: null },
      { key: 'contact', label: 'Contato', value: 'reservas@rionegroviagens.com' },
    ],
    missing: { label: 'o hotel de embarque', btn: 'Pedir hotel', reply: 'Bom dia, qual é o hotel de embarque do grupo? Com isso emitimos os vouchers hoje. Obrigada.' },
  },
  {
    id: 'i5', channel: 'ota', sender: 'Plataforma · OTA 88213', subject: 'Booking confirmed', time: 571, unread: false, code: 'EA-51906',
    segs: [T('Booking confirmed', 'lang'), T('. Experience: '), T('Meeting of the Waters', 'tour'), T('. Date: '), T('Nov 5', 'date'), T('. Travelers: '), T('2 adults (Emily Carter, Jacob Miller)', 'pax'), T('. Pickup: '), T('Hotel Tropical', 'hotel'), T('. Contact: '), T('emily.carter@mail.com', 'contact'), T('.')],
    fields: [
      { key: 'tour', label: 'Passeio', value: 'Encontro das Águas', sub: 'Lancha · 4h30' },
      { key: 'date', label: 'Data', value: 'Qui, 5 nov' },
      { key: 'dep', label: 'Saída', value: '08:30', mono: true, sub: 'Lancha Boto', seats: '14 lugares livres', spans: ['date', 'pax'] },
      { key: 'pax', label: 'Passageiros', value: '2 passageiros', names: [{ n: 'Emily Carter', c: 'US' }, { n: 'Jacob Miller', c: 'US' }] },
      { key: 'lang', label: 'Idioma', value: 'Inglês' },
      { key: 'hotel', label: 'Hotel', value: 'Hotel Tropical' },
      { key: 'contact', label: 'Contato', value: 'emily.carter@mail.com' },
    ],
  },
  {
    id: 'i6', channel: 'hotel', sender: 'Balcão Juma Ópera', subject: 'Reserva de balcão', time: 555, unread: false, code: 'EA-51907',
    segs: [T('Reserva de balcão: '), T('City tour Manaus histórica', 'tour'), T(', '), T('sexta, 6 nov', 'date'), T(', '), T('4 hóspedes', 'pax'), T(' (Oliver Hughes, Charlotte Evans e 2 filhos). Idioma '), T('inglês', 'lang'), T('. Hotel: '), T('Juma Ópera, quarto 412', 'hotel'), T('. Contato: '), T('ramal 412', 'contact'), T('.')],
    fields: [
      { key: 'tour', label: 'Passeio', value: 'Manaus histórica', sub: 'Terrestre · 3h30' },
      { key: 'date', label: 'Data', value: 'Sex, 6 nov' },
      { key: 'dep', label: 'Saída', value: '09:00', mono: true, sub: 'Van 01', seats: '4 lugares livres', spans: ['date', 'pax'] },
      { key: 'pax', label: 'Passageiros', value: '4 passageiros', names: [{ n: 'Oliver Hughes', c: 'GB' }, { n: 'Charlotte Evans', c: 'GB' }], more: 2 },
      { key: 'lang', label: 'Idioma', value: 'Inglês' },
      { key: 'hotel', label: 'Hotel', value: 'Juma Ópera · 412' },
      { key: 'contact', label: 'Contato', value: 'Ramal 412', mono: true },
    ],
  },
  {
    id: 'i7', channel: 'site', sender: 'Camille Laurent', subject: 'Checkout concluído', time: 538, unread: false, code: 'EA-51908',
    segs: [T('Checkout concluído', 'lang'), T('. Passeio: '), T('Pôr do sol no Rio Negro', 'tour'), T('. Data: '), T('sex, 6 nov', 'date'), T('. Passageiros: '), T('Camille Laurent, Hugo Moreau', 'pax'), T('. Hotel: '), T('Hotel Villa Amazônia', 'hotel'), T('. E-mail: '), T('camille.laurent@mail.fr', 'contact'), T('.')],
    fields: [
      { key: 'tour', label: 'Passeio', value: 'Pôr do sol no Rio Negro', sub: 'Lancha · 2h' },
      { key: 'date', label: 'Data', value: 'Sex, 6 nov' },
      { key: 'dep', label: 'Saída', value: '16:30', mono: true, sub: 'Lancha Tucunaré', seats: '7 lugares livres', spans: ['date', 'pax'] },
      { key: 'pax', label: 'Passageiros', value: '2 passageiros', names: [{ n: 'Camille Laurent', c: 'FR' }, { n: 'Hugo Moreau', c: 'FR' }] },
      { key: 'lang', label: 'Idioma', value: 'Francês' },
      { key: 'hotel', label: 'Hotel', value: 'Hotel Villa Amazônia' },
      { key: 'contact', label: 'Contato', value: 'camille.laurent@mail.fr' },
    ],
  },
  {
    id: 'i8', channel: 'whatsapp', sender: 'Daniel Kim', time: 520, unread: true, code: 'EA-51909',
    segs: [T('Hi', 'lang'), T(', is there space '), T('tomorrow', 'date'), T(' for the '), T('Anavilhanas day trip', 'tour'), T('? '), T('2 of us', 'pax'), T(', I am '), T('Daniel Kim', 'pax'), T(', visiting from New York.')],
    fields: [
      { key: 'tour', label: 'Passeio', value: 'Arquipélago de Anavilhanas', sub: 'Lancha · 9h30' },
      { key: 'date', label: 'Data', value: 'Qui, 5 nov' },
      { key: 'dep', label: 'Saída', value: '07:30', mono: true, sub: 'Lancha Pirarucu', seats: '3 lugares livres', spans: ['date', 'pax'] },
      { key: 'pax', label: 'Passageiros', value: '2 passageiros', names: [{ n: 'Daniel Kim', c: 'US' }], more: 1 },
      { key: 'lang', label: 'Idioma', value: 'Inglês' },
      { key: 'hotel', label: 'Hotel', value: null },
      { key: 'contact', label: 'Contato', value: 'Mesmo número do WhatsApp' },
    ],
    missing: { label: 'o hotel e o nome do acompanhante', btn: 'Pedir dados', reply: 'Hi Daniel, yes there is space. Could you share your hotel and your companion\'s full name so we can confirm?' },
  },
]
