const ERROR_MAP: Record<string, string> = {
  // Login
  'Invalid credentials': 'E-mail ou senha incorretos.',
  'Invalid email address': 'E-mail inválido.',
  'Password is required': 'A senha é obrigatória.',
  'Too many failed authentication attempts. Please try again in 15 minutes.':
    'Muitas tentativas. Aguarde 15 minutos.',

  // Auth / token
  'No token provided': 'Sessão expirada. Faça login novamente.',
  'Token error': 'Sessão inválida. Faça login novamente.',
  'Token malformatted': 'Sessão inválida. Faça login novamente.',
  'Invalid token': 'Sessão inválida. Faça login novamente.',
  'Authentication required': 'Autenticação necessária. Faça login novamente.',
  'User not found': 'Usuário não encontrado.',

  // Permissão
  'Access denied. Super Admin privileges required.': 'Sem permissão de acesso.',
  'Only the event creator can update the event':
    'Você não é o criador deste evento.',
  'Only the event creator can delete the event':
    'Sem permissão para deletar este evento.',

  // Eventos — validação
  'Event not found': 'Evento não encontrado.',
  'Title must be at least 3 characters':
    'O título deve ter pelo menos 3 caracteres.',
  'Title must be at most 100 characters':
    'O título deve ter no máximo 100 caracteres.',
  'Description must be at most 500 characters':
    'A descrição deve ter no máximo 500 caracteres.',
  'Invalid latitude. Must be between -90 and 90':
    'Latitude inválida. Use valores entre -90 e 90.',
  'Invalid longitude. Must be between -180 and 180':
    'Longitude inválida. Use valores entre -180 e 180.',
  'Event cannot start in the past': 'O evento não pode começar no passado.',
  'End time must be after start time':
    'O horário de fim deve ser após o início.',
  'Cover photo must be a valid URL': 'A URL da foto de capa é inválida.',
  'Invalid file type. Only JPEG, JPG, PNG and WEBP are allowed.':
    'Tipo de arquivo inválido. Use JPEG, PNG ou WEBP.',

  // Rate limit
  'Too many requests, please try again later.':
    'Muitas requisições. Tente novamente em 1 minuto.',

  // Servidor
  'Internal server error': 'Ocorreu um erro inesperado. Tente novamente.',
  'Authorization check failed': 'Ocorreu um erro inesperado. Tente novamente.',
};

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const mapped = ERROR_MAP[err.message];
    if (mapped) return mapped;

    // erros 5xx genéricos
    if (err.message.startsWith('HTTP 5')) {
      return 'Ocorreu um erro inesperado. Tente novamente.';
    }
  }
  return 'Ocorreu um erro. Tente novamente.';
}
