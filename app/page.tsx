import Star from './components/Star';

export default function Home() {
  return (
    <div className='flex flex-col flex-1 items-center justify-center'>
      <main className='flex flex-wrap flex-row flex-start w-full max-w-3xl'>
        <Star color='#00ffff' />
      </main>
    </div>
  );
}
