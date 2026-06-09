import './index.scss';

export default ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="ContainerComponent relative">
      <div className="mx-auto flex w-full max-w-[1240px] flex-wrap justify-between gap-y-4 px-4 py-4 sm:px-6 lg:px-5 lg:py-5 xl:px-0">
        {children}
      </div>
    </div>
  );
};
