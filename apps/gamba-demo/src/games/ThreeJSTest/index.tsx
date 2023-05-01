import React from 'react'
import { FaHatWizard } from 'react-icons/fa'

export default {
  name: 'ThreeJS test',
  shortName: 'three',
  description: '',
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  app: React.lazy(() => import('./App')),
  icon: () => <FaHatWizard />,
}
