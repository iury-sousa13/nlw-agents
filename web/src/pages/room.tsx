import { Navigate, useParams } from 'react-router-dom';

export function Room() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate replace to='/' />;
  }

  return <div>Room {id}</div>;
}
