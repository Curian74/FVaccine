import { Menu } from "@/types/menu";

const MAX_MENU_NAME_LENGTH = 50
const MAX_MENU_PATH_LENGTH = 50

export interface validateMenuProps {
  onNameError?: (errorMsg: string | undefined) => void,
  onPathError?: (errorMsg: string | undefined) => void,
}

export const validateMenu = (menu: Menu, props: validateMenuProps) => {
  let valid = true

  if (menu.name && menu.name.length > MAX_MENU_NAME_LENGTH) {
    valid = false
    if (props.onNameError) props.onNameError(`Menu's name must be at most ${MAX_MENU_NAME_LENGTH} characters in length.`)
  }
  else {
    if (props.onNameError) props.onNameError(undefined)
  }

  if (menu.path && menu.path.length > MAX_MENU_PATH_LENGTH) {
    valid = false
    if (props.onPathError) props.onPathError(`Menu's path must be at most ${MAX_MENU_PATH_LENGTH} characters in length.`)
  }
  else {
    if (props.onPathError) props.onPathError(undefined)
  }

  return valid
}
