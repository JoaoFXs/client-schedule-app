/**
 * Documentação: Central de Expressões Regulares do Projeto
 * Este arquivo armazena padrões reutilizáveis para validação de formulários.
 */

export const REGEX_PATTERNS ={
  // Regex que exige: 1 maiúscula, 1 minúscula, 1 número, 1 especial, e mínimo 8 caracteres.
  COMPLEX_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
  // Regex que exige que o nome seja composto por palavras, podendo conter preposições comuns em nomes, e sem permitir espaços no início ou no fim.
  COMPLEX_NAME_REGEX: /^(?![ ])(?!.*[ ]{2})((?:e|da|do|das|dos|de|d'|D'|la|las|el|los)\s*?|(?:[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð'][^\s]*\s*?)(?!.*[ ]$))+$/,
  // Regex que exige um formato de email válido, com letras, números, pontos, hífens e sublinhados antes do @, e um domínio válido após o @.
  COMPLEX_EMAIL_REGEX: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
}