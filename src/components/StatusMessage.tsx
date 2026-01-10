interface Props {
  message: { text: string; type: 'success' | 'error' } | null
}

export const StatusMessage = ({ message }: Props) => {
  if (!message) return null

  return (
    <div
      className={`p-4 rounded-lg mb-6 ${
        message.type === 'success'
          ? 'bg-green-100 text-green-800 border border-green-200'
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}
    >
      {message.text}
    </div>
  )
}
