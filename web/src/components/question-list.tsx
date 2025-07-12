import { useQuery } from '@tanstack/react-query';
import { QuestionItem } from './question-item';

type GetRoomQuestionsResponse = {
  id: string;
  question: string;
  answer?: string | null;
  createdAt: string;
}[];

type QuestionListProps = {
  roomId: string;
};

export function useRoomQuestions(roomId: string) {
  return useQuery({
    queryKey: ['get-questions', roomId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3333/rooms/${roomId}/questions`);
      const rooms: GetRoomQuestionsResponse = await response.json();

      return rooms;
    },
  });
}

export function QuestionList({ roomId }: QuestionListProps) {
  const { data } = useRoomQuestions(roomId);
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='font-semibold text-2xl text-foreground'>Perguntas & Respostas</h2>
      </div>

      {data?.map((question) => (
        <QuestionItem key={question.id} question={question} />
      ))}
    </div>
  );
}
