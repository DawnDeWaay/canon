import Star from './components/Star';

export default function Home() {
  return (
    <div className='flex flex-col flex-1 items-center justify-center'>
      <main className='flex flex-wrap flex-row flex-1 w-full max-w-3xl items-center justify-between py-32 px-16 sm:items-start gap-[-4px]'>
        <Star color='#ddd' />
      </main>
    </div>
  );
}
