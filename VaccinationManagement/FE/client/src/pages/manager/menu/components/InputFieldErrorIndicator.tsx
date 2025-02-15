import { Icon, Popup } from "semantic-ui-react"

export const InputFieldErrorIndicator = (
  props: {
    children?: JSX.Element | JSX.Element[] | string,
    error?: string,
    warning?: string,
  }
) => {
  return (
    <Popup position="top right" style={{ borderColor: (props.error) ? "red" : (props.warning) ? "yellow" : "" }} trigger={
      <span className="absolute right-3 h-full">
        <div className="flex h-full">
          <Icon
            color={(props.error) ? "red" : (props.warning) ? "yellow" : "grey"}
            style={{ marginTop: "auto", marginBottom: "80%" }}
            name="warning circle"
          />
        </div>
      </span>
    }
    >
      {
        (props.error) ? <p className="text-red-500">{props.error}</p> :
          (props.warning) ? <p className="text-yellow-700">{props.warning}</p> :
            props.children
      }
    </Popup>
  )
}
