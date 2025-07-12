import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type GetRoomsResponse = {
  id: string;
  name: string;
  createdAt: string;
  questionsCount: number;
}[];

export function timeAgo(date: Date) {
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  const now = new Date();
  const diff = (date.getTime() - now.getTime()) / 1000;

  const units = [
    { unit: 'year', seconds: 60 * 60 * 24 * 365 },
    { unit: 'month', seconds: 60 * 60 * 24 * 30 },
    { unit: 'day', seconds: 60 * 60 * 24 },
    { unit: 'hour', seconds: 60 * 60 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  for (const { unit, seconds } of units) {
    const value = Math.round(diff / seconds);
    if (Math.abs(value) >= 1) {
      return rtf.format(value, unit as Intl.RelativeTimeFormatUnit);
    }
  }

  return 'agora mesmo';
}

export function useRooms() {
  return useQuery({
    queryKey: ['get-rooms'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3333/rooms');
      const rooms: GetRoomsResponse = await response.json();

      return rooms;
    },
  });
}

export function RoomList() {
  const { data, isLoading } = useRooms();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salas recentes</CardTitle>
        <CardDescription>Acesso rápido para as salas criadas recentemente.</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        {isLoading && <p className='text-muted-foreground text-sm'>Carregando salas...</p>}
        {data?.map((room) => {
          return (
            <Link
              className='flex items-center justify-between rounded-lg border p-3 hover:bg-accent'
              key={room.id}
              to={`/room/${room.id}`}
            >
              <div className='flex-1 flex-col gap-1'>
                <h3 className='font-medium'>{room.name}</h3>
                <div className='flex items-center gap-2'>
                  <Badge className='text-xs' variant={'secondary'}>
                    {timeAgo(new Date(room.createdAt))}
                  </Badge>
                  <Badge className='text-xs' variant={'secondary'}>
                    {room.questionsCount} pergunta(s)
                  </Badge>
                </div>
              </div>
              <span className='flex items-center gap-2 text-sm'>
                Entrar <ArrowRight className='size-3' />
              </span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
