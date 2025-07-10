import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

type GetRoomsAPIResponse = {
  id: string;
  name: string;
}[];

export function CreateRoom() {
  const { data, isLoading } = useQuery({
    queryKey: ['get-rooms'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3333/rooms');
      const rooms: GetRoomsAPIResponse = await response.json();

      return rooms;
    },
  });

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      <div className='flex flex-col gap-2'>
        {data?.map((room) => (
          <Link key={room.id} to={`/room/${room.id}`}>
            {room.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
