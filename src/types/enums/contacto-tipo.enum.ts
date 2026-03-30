export enum ContactoTipo {
  EMAIL = 1,
  FAX = 2,
  LINKEDIN = 3,
  SKYPE = 4,
  TELEMOVEL = 5,
  TELEFONE = 6,
  WEBSITE = 7,
  WHATSAPP = 8,
}

export const ContactoTipoLabel: Record<ContactoTipo, string> = {
  [ContactoTipo.EMAIL]: 'Email',
  [ContactoTipo.FAX]: 'Fax',
  [ContactoTipo.LINKEDIN]: 'LinkedIn',
  [ContactoTipo.SKYPE]: 'Skype',
  [ContactoTipo.TELEMOVEL]: 'Telemóvel',
  [ContactoTipo.TELEFONE]: 'Telefone',
  [ContactoTipo.WEBSITE]: 'Website',
  [ContactoTipo.WHATSAPP]: 'WhatsApp',
}
