import { CreateMenu, GetLatestMenu } from "@/services/MenuService"
import { Menu as IMenu } from "@/types/menu"
import { useState } from "react"
import { Plus } from "lucide-react"
import FormatId from '@/helpers/constants/FormatID.json'
import { AxiosError } from "axios"
import { validateMenu, validateMenuProps } from "../utils/validateMenu"
import IconPicker from "./IconPicker"

const CreateForm = (params: {
  togglable?: boolean,
  parentID: string | null,
  onSubmit?: () => void,
  onSubmitWithSubmitCallBack?: (callBack: () => void) => void
  onSuccess?: () => void
}) => {
  const [active, setActive] = useState(false)
  const [edited, setEdited] = useState(false)
  const [formValue, setFormValue] = useState<IMenu>({
    id: '',
    parentID: params.parentID,
    status: false
  })

  const [nameError, setNameError] = useState<string>()
  const [pathError, setPathError] = useState<string>()

  const handleChange = (name: string, value: string) => {
    setEdited(true)
    setFormValue({ ...formValue, [name]: value })
  }

  const handleReset = () => {
    setEdited(false)
    setFormValue({
      id: '',
      parentID: params.parentID,
      status: false,
      name: '',
      path: '',
      icon: ''
    })
  }

  const validatorProps: validateMenuProps = {
    onNameError(errorMsg) { setNameError(errorMsg) },
    onPathError(errorMsg) { setPathError(errorMsg) },
  }

  const getLatestMenuId = async () => {
    try {
      const apiResponse = await GetLatestMenu()
      const preFix: string = apiResponse.id.substring(0, 2)
      const surFix: string = apiResponse.id.substring(2)
      return preFix + ((parseInt(surFix) + 1) + '').padStart(surFix.length, '0')
    }
    catch (err) {
      if (err instanceof AxiosError && err.status == 404) {
        const id = FormatId["Menu"]
        const preFix: string = id.substring(0, 2)
        const surFix: string = id.substring(2)
        return preFix + ((parseInt(surFix) + 1) + '').padStart(surFix.length, '0')
      }
      console.log(err)
      return ''
    }
  }

  const handleCreateMenu = async (onSuccess?: () => void) => {
    if (validateMenu(formValue, validatorProps)) {
      try {
        const latestId = await getLatestMenuId();
        await CreateMenu({ ...formValue, id: latestId })
        setFormValue({
          id: '',
          parentID: params.parentID,
          status: false
        })
        if (onSuccess) onSuccess()
        return true;
      }
      catch (err) {
        console.log(err)
        return false;
      }
    }
    return false;
  }

  return (
    (active || !params.togglable) ? (
      <div className="p-4 border rounded-lg shadow-sm bg-white flex items-center gap-4">
        <div className="flex-none">
          <p className="text-sm text-gray-600 mb-1">Icon</p>
          <IconPicker
            value={formValue.icon}
            onChange={(iconName) => handleChange("icon", iconName)}
          />
        </div>

        <div className="flex-1 relative">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Name</label>
            <input
              type="text"
              name="name"
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={formValue.name}
              readOnly={!(active || !params.togglable)}
            />
          </div>
          {nameError && (
            <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{nameError}</p>
          )}
        </div>

        <div className="flex-1 relative">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Path</label>
            <input
              type="text"
              name="path"
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={formValue.path}
              readOnly={!(active || !params.togglable)}
            />
          </div>
          {pathError && (
            <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{pathError}</p>
          )}
        </div>

        <button
          className="px-4 py-2 mt-6 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
          onClick={async () => {
            if (params.onSubmitWithSubmitCallBack) {
              params.onSubmitWithSubmitCallBack(async () => {
                if (await handleCreateMenu(params.onSuccess)) setActive(false)
              })
              return;
            }
            else if (params.onSubmit) {
              params.onSubmit()
            }
            if (await handleCreateMenu(params.onSuccess)) setActive(false)
          }}
        >
          Create
        </button>

        {params.togglable && edited && (
          <button
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            onClick={handleReset}
          >
            Reset
          </button>
        )}

        {params.togglable && !edited && (
          <button
            className="px-4 py-2 mt-6 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setActive(false)}
          >
            Cancel
          </button>
        )}
      </div>
    ) : (
      <div
        className="p-4 border rounded-lg shadow-sm bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setActive(true)}
      >
        <Plus className="text-gray-500" size={24} />
      </div>
    )
  )
}

export { CreateForm }