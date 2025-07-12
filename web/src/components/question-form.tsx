import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

// Esquema de validação no mesmo arquivo conforme solicitado
const createQuestionSchema = z.object({
  question: z
    .string()
    .min(1, 'Pergunta é obrigatória')
    .min(10, 'Pergunta deve ter pelo menos 10 caracteres')
    .max(500, 'Pergunta deve ter menos de 500 caracteres'),
});

type CreateQuestionFormData = z.infer<typeof createQuestionSchema>;

interface QuestionFormProps {
  roomId: string;
}

type CreateQuestionRequest = {
  question: string;
};

type CreateQuestionResponse = {
  questionId: string;
  answer: string;
};

export type GetRoomQuestionsResponse = Array<{
  id: string;
  question: string;
  answer: string | null;
  createdAt: string;
  isGeneratingAnswer?: boolean;
}>;

export function useCreateQuestion(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQuestionRequest) => {
      const response = await fetch(`http://localhost:3333/rooms/${roomId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: CreateQuestionResponse = await response.json();
      return result;
    },
    onMutate({ question }) {
      const questions = queryClient.getQueryData<GetRoomQuestionsResponse>(['get-questions', roomId]);

      const questionsArray = questions ?? [];

      const newQuestion = {
        id: crypto.randomUUID(),
        question,
        answer: null,
        createdAt: new Date().toISOString(),
        isGeneratingAnswer: true,
      };

      queryClient.setQueryData<GetRoomQuestionsResponse>(['get-questions', roomId], [newQuestion, ...questionsArray]);

      return { newQuestion, questions };
    },

    onSuccess(data, _variables, context) {
      queryClient.setQueryData<GetRoomQuestionsResponse>(['get-questions', roomId], (questions) => {
        if (!questions) {
          return questions;
        }

        if (!context.newQuestion) {
          return questions;
        }

        return questions.map((question) => {
          if (question.id === context.newQuestion.id) {
            return {
              ...context.newQuestion,
              id: data.questionId,
              answer: data.answer,
              isGeneratingAnswer: false,
            };
          }

          return question;
        });
      });
    },

    onError(_error, _variables, context) {
      if (context?.questions) {
        queryClient.setQueryData<GetRoomQuestionsResponse>(['get-questions', roomId], context.questions);
      }
    },
    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ['get-questions', roomId] });
    // },
  });
}

export function QuestionForm({ roomId }: QuestionFormProps) {
  const { mutateAsync: createQuestion } = useCreateQuestion(roomId);
  const form = useForm<CreateQuestionFormData>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      question: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function handleCreateQuestion(data: CreateQuestionFormData) {
    await createQuestion(data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fazer uma Pergunta</CardTitle>
        <CardDescription>Digite sua pergunta abaixo para receber uma resposta gerada por I.A.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className='flex flex-col gap-4' onSubmit={form.handleSubmit(handleCreateQuestion)}>
            <FormField
              control={form.control}
              name='question'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sua Pergunta</FormLabel>
                  <FormControl>
                    <Textarea
                      className='min-h-[100px]'
                      disabled={isSubmitting}
                      placeholder='O que você gostaria de saber?'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={isSubmitting} type='submit'>
              Enviar pergunta
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
