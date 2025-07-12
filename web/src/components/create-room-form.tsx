import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

type CreateRoomRequest = {
  name: string;
  description: string;
};

type CreateRoomResponse = {
  roomId: string;
};

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoomRequest) => {
      const response = await fetch('http://localhost:3333/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: CreateRoomResponse = await response.json();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-rooms'] });
    },
  });
}

const createRoomSchema = z.object({
  name: z.string().min(3, 'O nome da sala deve ter pelo menos 3 caracteres'),
  description: z.string(),
});

type CreateRoomFormData = z.infer<typeof createRoomSchema>;

export function CreateRoomForm() {
  const createRoomForm = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const { mutateAsync: createRoom } = useCreateRoom();

  async function handleCreateRoom(data: CreateRoomFormData) {
    await createRoom(data);
    createRoomForm.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar sala</CardTitle>
        <CardDescription>Crie uma nova sala para começar a fazer perguntas e receber respostas da I.A.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...createRoomForm}>
          <form className='flex flex-col gap-4' onSubmit={createRoomForm.handleSubmit(handleCreateRoom)}>
            <FormField
              control={createRoomForm.control}
              name='name'
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Nome da sala</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Digite o nome da sala' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={createRoomForm.control}
              name='description'
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <Button className='w-full' type='submit'>
              Criar sala
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
