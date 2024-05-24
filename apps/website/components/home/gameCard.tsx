import Tilt from "react-parallax-tilt";

export function GameCard({ title, image, link }) {
  return (
    <Tilt
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      perspective={800}
      transitionSpeed={1500}
      scale={1.05}
      gyroscope={true}
      glareMaxOpacity={0.1}
      className="transform hover:scale-105 transition-transform duration-500 ease-in-out"
    >
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex h-full flex-col gap-6 rounded-2xl p-8 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl overflow-hidden"
      >
        <div
          style={{ backgroundImage: `url(${image})` }}
          className="bg-cover bg-center absolute top-0 left-0 w-full h-full opacity-50 z-0"
        ></div>
        <div className="z-10">
          <div className="bg-gray-900 bg-opacity-75 px-4 py-1 rounded-full inline-block">
            <h2 className="text-xl font-semibold text-white font-mono">
              {title}
            </h2>
          </div>
        </div>
      </a>
    </Tilt>
  );
}
