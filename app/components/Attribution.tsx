/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
const Attribution = () => {
  const openInNewTab = (url: string) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  return (
    <div className='fixed right-4 bottom-4 z-50'>
      <div
        className='text-white hover:underline cursor-pointer opacity-0 md:opacity-100'
        onClick={() => openInNewTab('https://dawndewaay.dev/')}
      >
        © {new Date().getFullYear()} Dawn DeWaay III {'<3'}
      </div>
    </div>
  );
};

export default Attribution;
