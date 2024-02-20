import Link from 'next/link'
import Tilt from 'react-parallax-tilt'
import { projects } from '../projects'

export function GameCard({ title, image, link }) {
  return (
    <Tilt
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      perspective={800}
      transitionSpeed={1500}
      scale={1.05}
      gyroscope={true}
      glareMaxOpacity={.1}
      className="transform hover:scale-105 transition-transform duration-500 ease-in-out"
    >
      <a href={link} target="_blank" rel="noopener noreferrer" className="card-border relative flex h-full flex-col gap-6 rounded-2xl p-8 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl overflow-hidden">
        <div style={{ backgroundImage: `url(${image})` }} className="bg-cover bg-center absolute top-0 left-0 w-full h-full opacity-50 z-0"></div>
        <div className="z-10">
          <h2 className={'card-text text-xl font-semibold text-white font-mono'}>
            {title}
          </h2>
        </div>
      </a>
    </Tilt>
  )
}

export function Games() {
  return (
    <div>
      <div className="mt-32 max-w-7xl mx-auto px-6 md:px-12 xl:px-6 text-center">
        <h1 className="text-2xl text-center font-bold text-zinc-900 dark:text-white md:text-3xl lg:text-4xl">
          Featured projects built on Gamba
        </h1>

        <div className="relative mt-12 grid gap-9 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <GameCard key={index} title={project.name} image={project.thumbnail} link={project.link} />
          ))}

        </div>
        <p className="mt-8 text-xl text-zinc-700 dark:text-zinc-300 leading-8">
          <a href="https://explorer.gamba.so/" target="_blank" className="p-4 text-center" rel="noreferrer">
            Explore more →
          </a>
        </p>
      </div>
      <div className="mt-32 m-auto space-y-6 md:w-8/12 lg:w-7/12 pb-32 text-center">
        <div className="flex flex-wrap justify-center align-center gap-6 pt-24">
          <Link href="/docs" className="relative flex h-11 w-full items-center justify-center px-6 active:duration-75 sm:w-max gamba-main-button">
            <span>Build your own →</span>
          </Link>
        </div>
      </div>

    </div>
  )
}
