import Link from 'next/link'
import { useEffect } from 'react'

export function Home() {
  useEffect(
    () => {
      setTimeout(
        async () => {
          const video = document.querySelector('#hero-video') as HTMLVideoElement
          await video.play()
          video.setAttribute('autoplay', 'true')
        },
        100,
      )
    },
    [],
  )
  return (
    <div>
      <video
        id="hero-video"
        src="/hero.mp4"
        muted
        playsInline
      />
      <div className="hero max-w-7xl mx-auto px-6 md:px-12 xl:px-6 pt-32">
        <div className="lg:w-2/3 text-center mx-auto">
          <h1 className="text-zinc-900 dark:text-white font-bold text-5xl md:text-6xl xl:text-7xl">
            Tagline <span className="gradient-text">tagline</span> Tagline
          </h1>
          <p className="mt-8 text-xl text-zinc-700 dark:text-zinc-300 leading-8">
            Gamba Gamba Gamba Gamba Gamba Gamba Gamba
          </p>
          <div className="flex flex-wrap justify-center align-center gap-6 pt-96">
            <Link href="/docs" className="relative flex h-11 w-full items-center justify-center px-6 active:duration-75 sm:w-max gamba-main-button">
              <span>Learn more</span>
            </Link>
            <Link href="https://explorer.gamba.so" target="_blank" className="relative flex h-11 w-full items-center justify-center px-6 active:duration-75 sm:w-max gamba-main-button">
              <span>Explore</span>
            </Link>
          </div>
        </div>
      </div>

      {/* <div className="fadeIn mt-32 max-w-7xl mx-auto px-6 md:px-12 xl:px-6 text-center pb-32">
        <h1 className="text-2xl text-center font-bold text-zinc-900 dark:text-white md:text-3xl lg:text-4xl">
          Built on Gamba
        </h1>
        <p className="mt-8 text-xl text-zinc-700 dark:text-zinc-300 leading-8">
          Some projects that have integrated with Gamba
        </p>
        <div className="relative mt-12 grid gap-9 sm:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 6).map((project, index) => (
            <GameCard
              key={index}
              title={project.name}
              image={project.thumbnail}
              link={project.link}
            />
          ))}
        </div>
        <p className="mt-8 text-xl text-zinc-700 dark:text-zinc-300 leading-8">
          <a href="https://explorer.gamba.so/" target="_blank" className="p-4 text-center" rel="noreferrer">
            Explore more →
          </a>
        </p>
      </div> */}

      {/* <div className="mt-32 max-w-7xl mx-auto px-6 md:px-12 xl:px-6">
        <h1 className="text-2xl text-center font-bold text-zinc-900 dark:text-white md:text-3xl lg:text-4xl">
          Key Features
        </h1>
        <div className="relative mt-12 grid gap-9 sm:grid-cols-2 lg:grid-cols-3">
          <Tilt
            tiltMaxAngleX={5}
            tiltMaxAngleY={5}
            perspective={800}
            transitionSpeed={1500}
            gyroscope={true}
            glareMaxOpacity={.1}
            className="depth-wrapper card-border relative flex h-full flex-col gap-6 rounded-2xl bg-zinc-100 p-8 dark:bg-zinc-900"
          >
            <h2 className="elevated text-xl font-semibold text-zinc-900 dark:text-white">
              Plug and Earn
            </h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              Gamba's open-source SDK is really easy to work with. Simply provide your Solana address and start earning on every bet made on your site.
            </p>
            <div className="floating-icon plug" />
          </Tilt>
          <Tilt
            tiltMaxAngleX={5}
            tiltMaxAngleY={5}
            perspective={800}
            transitionSpeed={1500}
            gyroscope={true}
            glareMaxOpacity={.1}
            className="depth-wrapper card-border relative flex h-full flex-col gap-6 rounded-2xl bg-zinc-100 p-8 dark:bg-zinc-900"
          >
            <h2 className="elevated text-xl font-semibold text-zinc-900 dark:text-white">
              Provably Fair
            </h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              Every result can be independently verified by the player. This means your users can start playing without worrying about trust.
            </p>
            <div className="floating-icon fair" />
          </Tilt>
          <Tilt
            tiltMaxAngleX={5}
            tiltMaxAngleY={5}
            perspective={800}
            transitionSpeed={1500}
            gyroscope={true}
            glareMaxOpacity={.1}
            className="depth-wrapper card-border relative flex h-full flex-col gap-6 rounded-2xl bg-zinc-100 p-8 dark:bg-zinc-900"
          >
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white elevated">
              Decentralized
            </h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              Gamba exists on-chain and is completely permissionless. No license needed to start building. :)
            </p>
            <div className="floating-icon shrimp" />
          </Tilt>
        </div>
      </div> */}

      {/* <div className="mt-32 max-w-7xl mx-auto px-6 md:px-12 xl:px-6">
        <div className="lg:p-16 space-y-6 md:flex md:gap-10 justify-center md:space-y-0">
          <div className="md:w-7/12 lg:w-1/2">
            <Tilt
              tiltMaxAngleX={5}
              tiltMaxAngleY={5}
              perspective={1000}
              transitionSpeed={10000}
              gyroscope={true}
              glareMaxOpacity={.1}
              tiltAngleYInitial={-2}
              tiltAngleXInitial={2}
              className="depth-wrapper codeblock"
            >
              <CodeBlock
                text={code}
                language="jsx"
                showLineNumbers={false}
                theme={dracula}
              />
            </Tilt>
          </div>
          <div className="md:w-7/12 lg:w-1/2">
            <h1 className="text-3xl font-bold text-zinc-900 md:text-4xl dark:text-white">
            </h1>
            <p className="text-lg my-8 text-zinc-600 dark:text-zinc-300">
            </p>
          </div>
        </div>
      </div> */}
    </div>
  )
}
