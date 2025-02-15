import { Menu as IMenu } from "@/types/menu"
import React, { useEffect, useState } from "react"
import { Button, Checkbox, Input, Segment, SegmentGroup, Transition } from "semantic-ui-react"
import { CreateForm } from "./CreateForm"
import { GetMenusPaged, UpdateMenu } from "@/services/MenuService"
import RoleSelector from "./RoleSelector"
import { validateMenu, validateMenuProps } from "../utils/validateMenu"
import { InputFieldErrorIndicator } from "./InputFieldErrorIndicator"
import * as LucideIcons from "lucide-react";
import IconPicker from "./IconPicker"

const SubMenuSegment = (params: {
  menu: IMenu,
  onToggleStatus?: () => void,
  onSubmit?: () => void,

  // For when you want to define how update/setter functions are called yourself
  onToggleStatusWithUpdateCallBack?: (menu: IMenu, callBack: () => void) => void
  onSubmitWithSubmitCallBack?: (callBack: () => void) => void

  // Post call backs should get called right after the call back (just to add a way to customize the callback)
  onSuccess?: () => void
}) => {
  const [mouseIsInside, setMouseIsInside] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [edited, setEdited] = useState(false)
  const [formValue, setFormValue] = useState<IMenu>(params.menu)

  const [pathIsEmpty, setPathIsEmpty] = useState(false)
  const handleChange = (name: string, value: string | boolean | number[]) => {
    setEdited(true)
    if (name === "path") setPathIsEmpty(!value)
    setFormValue({ ...formValue, [name]: value })
  }

  const handleUpdateMenuStatus = async (status = !formValue.status) => {
    const apiResponse = await UpdateMenu({
      id: formValue.id,
      parentID: formValue.parentID,
      status: status
    })

    if (apiResponse.status !== undefined) {
      setFormValue({ ...formValue, status: apiResponse.status })
    }
  }

  const [nameError, setNameError] = useState<string>()
  const [pathError, setPathError] = useState<string>()

  const validatorProps: validateMenuProps = {
    onNameError(errorMsg) { setNameError(errorMsg) },
    onPathError(errorMsg) { setPathError(errorMsg) },
  }

  const handleUpdateMenu = async (onSuccess?: () => void) => {
    if (validateMenu(formValue, validatorProps)) {
      try {
        const apiResponse = await UpdateMenu(formValue)
        setFormValue(apiResponse)
        if (onSuccess) onSuccess()
      }
      catch (err) {
        console.log(err)
      }
    }
  }

  const handleReset = () => {
    setEdited(false)
    setFormValue(params.menu)
    setNameError(undefined)
    setPathError(undefined)
    setPathIsEmpty(false)
  }

  return (
    <Segment style={{ display: "flex", alignItems: "center" }} onMouseEnter={() => setMouseIsInside(true)} onMouseLeave={() => setMouseIsInside(false)}>

      {(editMode) ?
        <IconPicker
          value={formValue.icon}
          onChange={(iconName) => handleChange("icon", iconName)}
        />
        :
        <p className={(editMode) ? "bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg items-center" : ""}>
          {formValue.icon && React.createElement(LucideIcons[formValue.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>, { className: "h-5 w-5" })}
        </p>
      }

      <div className="mx-1 flex-1 relative">
        <Input
          label="Name"
          name="name"
          onChange={(_, v) => handleChange(v.name, v.value)}
          size='small'
          value={formValue.name ?? ''}
          className="w-full"
          readOnly={!editMode}
        />
        {nameError && <InputFieldErrorIndicator error={nameError} />}
      </div>

      <div className="mx-1 flex-1 relative">
        <Input
          label="Path"
          name="path"
          onChange={(_, v) => handleChange(v.name, v.value)}
          size='small'
          value={formValue.path ?? ''}
          className="w-full"
          readOnly={!editMode}
        />
        {(pathError || pathIsEmpty) && <InputFieldErrorIndicator error={pathError} warning={(pathIsEmpty) ? "Submenu's path should not be empty." : undefined} />}
      </div>

      <div className="mx-1 flex-1">
        <RoleSelector
          roles={formValue.authorizedRoles}
          readOnly={!editMode}
          onChange={(value) => handleChange("authorizedRoles", value)}
        />
      </div>

      <Checkbox toggle style={{ marginRight: "22px" }} checked={formValue.status} onClick={() => {
        if (params.onToggleStatusWithUpdateCallBack) {
          params.onToggleStatusWithUpdateCallBack(params.menu, handleUpdateMenuStatus)
          return;
        }
        else if (params.onToggleStatus) {
          params.onToggleStatus()
        }
        handleUpdateMenuStatus()
      }} readOnly />

      {(editMode) ?
        <>
          <Button color="teal" onClick={() => {
            if (params.onSubmitWithSubmitCallBack) {
              params.onSubmitWithSubmitCallBack(() => {
                handleUpdateMenu(params.onSuccess)
                setEdited(false)
              })
              return;
            }
            else if (params.onSubmit) {
              params.onSubmit()
              setEdited(false)
            }
            handleUpdateMenu()
          }}
            disabled={!edited}
          >Save</Button>
          {(edited) ?
            <Button onClick={handleReset}>Reset</Button>
            :
            <Button onClick={() => setEditMode(false)}>Cancel</Button>
          }
        </>
        :
        <Button
          icon="edit"
          size="large"
          circular
          style={(mouseIsInside) ? { opacity: 1 } : { opacity: 0 }}
          onClick={() => setEditMode(!editMode)}
        />}

    </Segment>
  )
}


// Maybe I should've just used Contexts..
const MenuSegment = (params: {
  menu: IMenu,
  onToggleStatus?: () => void,
  onOpen?: () => void,
  onClose?: () => void,
  onSubmit?: () => void,
  onReset?: () => void,

  // For when you want to define how update/setter functions are called yourself
  onToggleStatusWithUpdateCallBack?: (callBack: () => void) => void
  onOpenWithSetterCallBack?: (callBack: () => void) => void
  onCloseWithSetterCallBack?: (callBack: () => void) => void
  onSubmitWithSubmitCallBack?: (callBack: () => void) => void
  onResetWithCallBack?: (callBack: () => void) => void

  // Post call backs should get called right after the call back (just to add a way to customize the callback)
  onSuccess?: () => void

  // Used to pass the functions deeper to the submenus... Definitely should've just used Contexts
  subMenuParams: {
    onToggleStatusWithUpdateCallBack?: (menu: IMenu, callBack: () => void) => void
    onSubmitWithSubmitCallBack?: (callBack: () => void) => void

    createFrom_onSubmitWithSubmitCallBack?: (callBack: () => void) => void
  }

}) => {

  const [mouseIsInside, setMouseIsInside] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [edited, setEdited] = useState(false)
  const [formValue, setFormValue] = useState<IMenu>(params.menu)
  const [subMenuList, setSubMenuList] = useState<IMenu[]>([])

  const handleChange = (name: string, value: string | boolean | number[]) => {
    setEdited(true)
    setFormValue({ ...formValue, [name]: value })
  }

  const fetchSubMenus = async () => {
    const apiResponse = await GetMenusPaged(1, 10, undefined, params.menu.id)
    setSubMenuList(apiResponse.menus)
    return apiResponse.menus
  }

  const handleUpdateMenuStatus = async (status = !formValue.status) => {
    const apiResponse = await UpdateMenu({
      id: formValue.id,
      parentID: formValue.parentID,
      status: status
    })

    if (apiResponse.status !== undefined) {
      setFormValue({ ...formValue, status: apiResponse.status })
    }
  }


  const [nameError, setNameError] = useState<string>()
  const [pathError, setPathError] = useState<string>()

  const validatorProps: validateMenuProps = {
    onNameError(errorMsg) { setNameError(errorMsg) },
    onPathError(errorMsg) { setPathError(errorMsg) },
  }

  const handleUpdateMenu = async (onSuccess?: () => void) => {
    if (validateMenu(formValue, validatorProps)) {
      try {
        const apiResponse = await UpdateMenu(formValue)
        setFormValue(apiResponse)
        if (onSuccess) onSuccess()
      }
      catch (err) {
        console.log(err)
      }
    }
  }

  useEffect(() => {
    setFormValue(params.menu)
    fetchSubMenus()
    setEditMode(false)
  }, [params.menu])

  useEffect(() => {
    fetchSubMenus()
  }, [])

  const handleReset = () => {
    setEdited(false)
    setFormValue(params.menu)
    setNameError(undefined)
    setPathError(undefined)
  }

  return (
    <SegmentGroup piled className="me-1" onMouseEnter={() => setMouseIsInside(true)} onMouseLeave={() => setMouseIsInside(false)}>
      <Segment secondary stacked={!editMode} style={{ display: "flex", alignItems: "center" }}>

        {(editMode) ?
          <IconPicker
            value={formValue.icon}
            onChange={(iconName) => handleChange("icon", iconName)}
          />
          :
          <p className={(editMode) ? "bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg items-center" : ""}>
            {formValue.icon && React.createElement(LucideIcons[formValue.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>, { className: "h-5 w-5" })}
          </p>
        }

        <div className="mx-1 flex-1 relative">
          <Input
            label="Name"
            name="name"
            onChange={(_, v) => handleChange(v.name, v.value)}
            size='small'
            value={formValue.name ?? ''}
            className="w-full"
            readOnly={!editMode}
          />
          {nameError && <InputFieldErrorIndicator error={nameError} />}
        </div>

        <div className="mx-1 flex-1 relative">
          <Input
            label="Path"
            name="path"
            onChange={(_, v) => handleChange(v.name, v.value)}
            size='small'
            value={formValue.path ?? ''}
            className="w-full"
            readOnly={!editMode}
          />
          {pathError && <InputFieldErrorIndicator error={pathError} />}
        </div>

        <div className="mx-1 flex-1">
          <RoleSelector
            roles={formValue.authorizedRoles}
            readOnly={!editMode}
            onChange={(value) => handleChange("authorizedRoles", value)}
          />
        </div>

        <Checkbox toggle style={{ marginRight: "22px" }} checked={formValue.status} onClick={() => {
          if (params.onToggleStatusWithUpdateCallBack) {
            params.onToggleStatusWithUpdateCallBack(handleUpdateMenuStatus)
            return;
          }
          else if (params.onToggleStatus) {
            params.onToggleStatus()
          }
          handleUpdateMenuStatus()
        }} readOnly />

        {(editMode) ?
          <>
            <Button color="blue" onClick={() => {
              if (params.onSubmitWithSubmitCallBack) {
                params.onSubmitWithSubmitCallBack(() => {
                  handleUpdateMenu(params.onSuccess)
                  setEdited(false)
                })
                return;
              }
              else if (params.onSubmit) {
                params.onSubmit()
                setEdited(false)
              }
              handleUpdateMenu()
            }}
              disabled={!edited}
            >Save</Button>

            {(edited) ?
              <Button onClick={() => {
                if (params.onResetWithCallBack) {
                  params.onResetWithCallBack(handleReset)
                  return;
                }
                else if (params.onReset) {
                  params.onReset()
                }
                handleReset()
              }}
              >Reset</Button>
              :
              <Button onClick={() => {
                if (params.onCloseWithSetterCallBack) {
                  params.onCloseWithSetterCallBack(() => setEditMode(false))
                  return;
                }
                else if (params.onClose) {
                  params.onClose()
                }
                setEditMode(false)
              }}
              >Cancel</Button>
            }
          </>
          :
          <Button
            icon="edit"
            size="large"
            circular
            style={(mouseIsInside) ? { opacity: 1 } : { opacity: 0 }}
            onClick={() => {
              if (params.onOpenWithSetterCallBack) {
                params.onOpenWithSetterCallBack(() => setEditMode(true))
                return;
              }
              else if (params.onOpen) {
                params.onOpen()
              }
              setEditMode(true)
            }}
          />}

      </Segment>
      <div style={{ height: "0" }}>
        <Transition
          unmountOnHide
          animation="slide down"
          duration={200}
          visible={editMode}
        >
          <Segment tertiary style={{ border: 0, zIndex: 3 }}>
            {
              subMenuList.map((submenu) =>
                <SubMenuSegment menu={submenu}
                  onToggleStatusWithUpdateCallBack={params.subMenuParams.onToggleStatusWithUpdateCallBack}
                  onSubmitWithSubmitCallBack={params.onSubmitWithSubmitCallBack}
                  onSuccess={params.onSuccess}
                />
              )
            }
            <CreateForm
              togglable
              parentID={params.menu.id}
              onSubmitWithSubmitCallBack={params.subMenuParams.createFrom_onSubmitWithSubmitCallBack}
              onSuccess={() => {
                if (params.onSuccess) params.onSuccess()
                fetchSubMenus()
              }}
            />
          </Segment>
        </Transition>
      </div>
    </SegmentGroup>
  )
}


export { MenuSegment, SubMenuSegment }
