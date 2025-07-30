import Message from '~/components/Message'

export default async function ChatPage() {
  return (
    <>
      <h3 className="font-light text-lg">
        Du hast schon die ganze Zeit eine Folge im Kopf, weißt aber nicht mehr
        wie sie heißt? Lass die von der KI helfen!
      </h3>

      <div className="space-y-4">
        <Message
          author={'system'}
          content={
            'Hey, du hast Fragen zu einer bestimmten Folge? Schreib mir gerne mehr :)'
          }
          timestamp={new Date()}
        />

        <Message
          author={'user'}
          content={
            'Hey, du hast Fragen zu einer bestimmten Folge? Schreib mir gerne mehr :)'
          }
          timestamp={new Date()}
        />
      </div>
    </>
  )
}
