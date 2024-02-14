import { CaretDownIcon } from '@radix-ui/react-icons'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { Flex, Text } from '@radix-ui/themes'
import React from 'react'
import { NavLink } from 'react-router-dom'
import './NavigationMenu.styles.css'

export const ListItemNavLink = ({ children, title, ...props }: React.PropsWithChildren<{title: string, to: string}>) => (
  <li>
    <NavigationMenu.Link asChild>
      <NavLink className="ListItemLink" {...props}>
        <Flex direction="column">
          <Text>{title}</Text>
          <Text color="gray" size="1">{children}</Text>
        </Flex>
      </NavLink>
    </NavigationMenu.Link>
  </li>
)

export const ListItemLink = ({ children, title, ...props }: React.PropsWithChildren<{title: string, href: string}>) => (
  <li>
    <NavigationMenu.Link asChild>
      <a className="ListItemLink" target="_blank" {...props}>
        <Flex direction="column">
          <Text>{title}</Text>
          <Text color="gray" size="1">{children}</Text>
        </Flex>
      </a>
    </NavigationMenu.Link>
  </li>
)

const NavigationMenuDemo = () => {
  return (
    <NavigationMenu.Root className="NavigationMenuRoot">
      <NavigationMenu.List className="NavigationMenuList">
        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="NavigationMenuTrigger">
            Tools <CaretDownIcon className="CaretDown" aria-hidden />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            <ul className="List">
              <ListItemNavLink title="User" to="/user">
                Manage your user account
              </ListItemNavLink>
              <ListItemNavLink title="DAO" to="/dao">
                Manage the DAO and distribute fees
              </ListItemNavLink>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="NavigationMenuTrigger">
            More <CaretDownIcon className="CaretDown" aria-hidden />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            <ul className="List">
              <ListItemLink title="Github" href="https://github.com/gamba-labs">
                👨‍💻 Build your own app using the Gamba SDKs and templates
              </ListItemLink>
              <ListItemLink title="Discord" href="https://discord.gg/xjBsW3e8fK">
                💬 Give feedback, ideas, and be the first to hear about new announcements.
              </ListItemLink>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Indicator className="NavigationMenuIndicator">
          <div className="Arrow" />
        </NavigationMenu.Indicator>
      </NavigationMenu.List>

      <div className="ViewportPosition">
        <NavigationMenu.Viewport className="NavigationMenuViewport" />
      </div>
    </NavigationMenu.Root>
  )
}

export default NavigationMenuDemo
