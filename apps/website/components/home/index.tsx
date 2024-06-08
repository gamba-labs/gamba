import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CodeBlock, dracula } from 'react-code-blocks'
import Tilt from 'react-parallax-tilt'
import { projects } from '../projects'
import { GameCard } from './gameCard'

export function Home() {
  // const randomProjects = [...projects].sort(() => 0.5 - Math.random()).slice(0, 6)
  // <3 next.js - https://stackoverflow.com/questions/73071457/randomize-an-array-using-useeffect-in-nextjs
  const [randomProjects, setRandomProjects] = useState([])
  useEffect(() => {
    const shuffledProjects = [...projects]
      .sort(() => 0.5 - Math.random())
      .slice(0, 6)
    setRandomProjects(shuffledProjects)
  }, [projects])

  useEffect(() => {
    setTimeout(async () => {
      const video = document.querySelector('#hero-video') as HTMLVideoElement
      await video.play()
      video.setAttribute('autoplay', 'true')
    }, 100)
  }, [])

  const code = `
import React from 'react';
import { GambaProvider } from "gamba-react-v2";
import { GambaPlatformProvider, GambaUi } from "gamba-react-ui-v2";

function DoubleOrNothing() {
  const game = GambaUi.useGame();

  const doubleOrNothing = async () => {
    try {
      await game.play({
        bet: [0, 2],
        wager: solToLamports(0.1)
      })

      const result = await game.result()

      if (result.payout > 0) {
        console.log("Win")
      } else {
        console.log("Loss")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  };

  return (
    <GambaUi.PlayButton onClick={doubleOrNothing}>
      Double or Nothing
    </GambaUi.PlayButton>
  );
}

function App() {
  return (
    <GambaProvider>
      <GambaPlatformProvider creator={"<CREATOR_ADDRESS_HERE>"}>
        <DoubleOrNothing />
      </GambaPlatformProvider>
    </GambaProvider>
  );
}
`

  return (
    <div className="fadeIn">
      <div className="hero max-w-7xl mx-auto px-6 md:px-12 xl:px-6 py-32">
        <div className="appear lg:w-2/3 text-center mx-auto">
          <h1 className="text-zinc-900 dark:text-white font-bold text-5xl md:text-6xl xl:text-7xl">
            Build <span className="gradient-text">on-chain</span> games on
            Solana
          </h1>
          <p className="mt-8 text-xl text-zinc-700 dark:text-zinc-300 leading-8">
            Gamba provides tools for building & playing games directly on-chain.
          </p>
          <video id="hero-video" src="/hero.mp4" muted playsInline />
          <div className="flex flex-wrap justify-center align-center gap-6">
            <Link
              href="https://explorer.gamba.so"
              target="_blank"
              className="relative flex h-11 w-full overflow-hidden items-center justify-center px-6 active:duration-75 sm:w-max gamba-main-button filled"
            >
              <span>Explore ✨</span>
            </Link>
            <Link
              href="/docs"
              className="relative flex h-11 w-full items-center justify-center px-6 active:duration-75 sm:w-max gamba-main-button"
            >
              <span>Docs</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-24 max-w-7xl mx-auto px-6 md:px-12 xl:px-6 text-center">
        <h1 className="text-2xl text-center font-bold text-zinc-900 dark:text-white md:text-3xl lg:text-4xl">
          Built on Gamba
        </h1>
        <p className="mt-8 text-xl text-zinc-700 dark:text-zinc-300 leading-8">
          Some projects that have integrated with Gamba
        </p>
        <div className="relative mt-12 grid gap-9 sm:grid-cols-2 lg:grid-cols-3">
          {randomProjects.map((project) => (
            <GameCard
              key={project.name}
              title={project.name}
              image={project.thumbnail}
              link={project.link}
            />
          ))}
        </div>
        <p className="mt-8 text-xl text-zinc-700 dark:text-zinc-300 leading-8">
          <Link
            href="/docs/examples"
            className="px-4 py-2 text-center"
            rel="noreferrer"
          >
            Explore more →
          </Link>
        </p>
      </div>

      <div className="mt-36 max-w-7xl mx-auto px-6 md:px-12 xl:px-6">
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
            glareMaxOpacity={0.1}
            className="depth-wrapper card-border relative flex h-full flex-col gap-6 rounded-2xl bg-zinc-100 p-8 dark:bg-zinc-900"
          >
            <h2 className="elevated text-xl font-semibold text-zinc-900 dark:text-white">
              Plug and Earn
            </h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              Gamba{'\''}s open-source SDK is really easy to work with. Simply
              provide your Solana address and start earning on every bet made on
              your site.
            </p>
            <div className="floating-icon plug" />
          </Tilt>
          <Tilt
            tiltMaxAngleX={5}
            tiltMaxAngleY={5}
            perspective={800}
            transitionSpeed={1500}
            gyroscope={true}
            glareMaxOpacity={0.1}
            className="depth-wrapper card-border relative flex h-full flex-col gap-6 rounded-2xl bg-zinc-100 p-8 dark:bg-zinc-900"
          >
            <h2 className="elevated text-xl font-semibold text-zinc-900 dark:text-white">
              Provably Fair
            </h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              Every result can be independently verified by the player. This
              means your users can start playing without worrying about trust.
            </p>
            <div className="floating-icon fair" />
          </Tilt>
          <Tilt
            tiltMaxAngleX={5}
            tiltMaxAngleY={5}
            perspective={800}
            transitionSpeed={1500}
            gyroscope={true}
            glareMaxOpacity={0.1}
            className="depth-wrapper card-border relative flex h-full flex-col gap-6 rounded-2xl bg-zinc-100 p-8 dark:bg-zinc-900"
          >
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white elevated">
              Decentralized
            </h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              Gamba exists on-chain and is completely permissionless. No license
              needed to start building. :)
            </p>
            <div className="floating-icon shrimp" />
          </Tilt>
        </div>
        <p className="flex justify-center mt-8 text-xl text-zinc-700 dark:text-zinc-300 leading-8">
          <Link
            href="/docs"
            className="px-4 py-2 text-center"
            rel="noreferrer"
          >
            Start Building →
          </Link>
        </p>
      </div>

      <div className="mt-32 max-w-7xl mx-auto px-6 md:px-12 xl:px-6">
        <div className="lg:py-20 space-y-6 md:flex md:gap-10 justify-center md:space-y-0">
          <div className="md:w-7/12 lg:w-1/2">
            <Tilt
              tiltMaxAngleX={5}
              tiltMaxAngleY={5}
              perspective={1000}
              transitionSpeed={10000}
              gyroscope={true}
              glareMaxOpacity={0.1}
              tiltAngleYInitial={-2}
              tiltAngleXInitial={2}
              className="depth-wrapper codeblock overflow-x-hidden"
            >
              <div className="max-h-96 overflow-y-auto -p-10">
                <CodeBlock
                  text={code}
                  language="jsx"
                  showLineNumbers={false}
                  theme={dracula}
                  className="overflow-x-hidden"
                />
              </div>
            </Tilt>
          </div>
          <div className="md:w-7/12 lg:w-1/2">
            <h1 className="text-3xl font-bold text-zinc-900 md:text-4xl dark:text-white">
              ✨ Zero deployments
            </h1>
            <p className="text-lg my-8 text-zinc-600 dark:text-zinc-300">
              With just a static webpage you can build betting games that
              interact directly with the Solana blockchain, and collect fees on
              every bet made via your frontend.
            </p>
            <p className="text-lg my-8 text-zinc-600 dark:text-zinc-300">
              Check out our
              {' '}
              <a
                href="https://github.com/gamba-labs"
                target="_blank"
                className="text-[#8851ff] hover:underline" rel="noreferrer"
              >
                Github
              </a>
              {' '}to get started
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
