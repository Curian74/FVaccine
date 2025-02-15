import { Button, Checkbox, Container, Header, Input, Message, Pagination, Segment } from "semantic-ui-react";
import { MenuTableRow, MenuTableCell } from "./components/Table";
import { MenuSegment } from "./components/MenuSegment";
import message from '@/helpers/constants/message.json';
import { useEffect, useRef, useState } from "react";
import { PaginatedList } from "@/helpers/utils";
import { Menu as IMenu } from "@/types/menu";
import { GetMenusPaged } from "@/services/MenuService";
import { CreateForm } from "./components/CreateForm";

enum PopupType {
  confirmation,
  alert,
  createMenu
}

// Amount of entries per page
const defaultPageSize = 5
// const pageSizeMin = 3
// const pageSizeMax = 30
// const pageSizeOptions = [...Array(pageSizeMax - pageSizeMin + 1).keys()]
//   .map((i) => ({ key: i, value: i + pageSizeMin, text: i + pageSizeMin }))

const pageSizeOptions = [
  { key: 1, value: 5, text: 5 },
  { key: 2, value: 10, text: 10 },
  { key: 3, value: 15, text: 15 }
]

// Return an element when table is empty
const listOrDefault = (elementList: JSX.Element[]) => {
  if (elementList.length < 1) return (
    <MenuTableRow>
      <MenuTableCell colSpan={5}>
        <Header textAlign='center' as={'h2'}>{message["MSG 8"]}</Header>
      </MenuTableCell>
    </MenuTableRow>
  )
  return elementList
}

const ListMenu = () => {
  // Warn that reloading is needed in order for changes to take place
  const [reloadWarning, setReloadWarning] = useState(false);
  const [, setEdited] = useState(false);

  const pageSize = useRef(defaultPageSize)
  const [menuList, setMenuList] = useState<PaginatedList<IMenu>>({
    currentPage: 0,
    totalItems: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    list: []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [menuFetchStatus, setMenuFetchStatus] = useState(true)

  const [popupDisplay, setPopupDisplay] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | JSX.Element | undefined>(undefined);
  const [popupType, setPopupType] = useState<PopupType>(PopupType.alert);
  const [popupPostAlertAction, setPopupPostAlertAction] = useState<() => void>();
  const [popupConfirmAction, setPopupConfirmAction] = useState<() => void>();

  const handlePageChange = (page: number, status?: boolean) => {
    GetMenusPaged(
      page,
      pageSize.current,
      searchQuery,
      undefined,
      status ?? menuFetchStatus
    ).then((apiResponse) => {
      const list = apiResponse.menus
      if (list && apiResponse.currentPage > 1 && list.length < 1) {
        handlePageChange(Math.max(apiResponse.totalPages, 1))
        return;
      }
      setMenuList({ ...apiResponse, list: list });
    })
  }

  const handlePageSizeChange = (_pageSize: number) => {
    pageSize.current = _pageSize
    handlePageChange(1)
  }

  const handleChangeMenuFetchStatus = (status: boolean) => {
    setMenuFetchStatus(status)
    handlePageChange(1, status)
  }

  const showingFrom = (menuList.currentPage <= 0) ? 0 : (menuList.currentPage - 1) * pageSize.current + 1
  const showingTo = (menuList.currentPage <= 0) ? 0 : showingFrom + menuList.list.length - 1

  // Init page 1 + reload the table when searchQuery changes
  useEffect(() => {
    handlePageChange(1)
  }, [searchQuery, menuFetchStatus])

  const onFirstChange = () => {
    setEdited((prev) => {
      if (!prev) {
        changeGuard(false, () => window.location.reload(), "Changes to the sidebar require reloading the page to take place, reload now?")
        setReloadWarning(true)
      }
      return true
    })
  }

  const changeGuard = <T,>(condition: boolean, action: (params?: T) => void, message: string, invokeOnFirstChange?: boolean, params?: T) => {
    if (condition) action(params)
    else {
      setPopupType(PopupType.confirmation)
      setPopupMessage(message)
      setPopupConfirmAction(() => () => { setPopupDisplay(false); if (invokeOnFirstChange == undefined || invokeOnFirstChange) onFirstChange(); action(params); })
      setPopupDisplay(true)
    }
  }

  return (
    <>
      <Container>
        <Header as='h2' textAlign="center">MENU LIST</Header>
        <Segment>
          <div className="flex justify-between mb-2">
            <div>
              <label htmlFor="entries" className="mr-2">Show</label>
              <select
                name="entries"
                className="border rounded p-1"
                onChange={(e) => { handlePageSizeChange(parseInt(e.target.value)) }}
                value={pageSize.current}
              >
                {pageSizeOptions.map((op) => <option value={op.value}>{op.text}</option>)}
              </select> entries
            </div>

            <div className="flex items-center space-x-4">
              <div style={{ height: "1rm", lineHeight: "1rm", textAlign: "center", float: "left" }}>Active</div>

              <Checkbox toggle style={{ float: "right" }} checked={menuFetchStatus} onClick={() => handleChangeMenuFetchStatus(!menuFetchStatus)} readOnly />
              <div className="relative">
                <Input size='mini' icon={"search"} iconPosition='left' placeholder='Search...' onChange={(_, v) => setSearchQuery(v.value)} />
              </div>
            </div>
          </div>

          {
            listOrDefault(menuList?.list.map(
              (menu) =>
                // <>{menu.name}{menu.icon}
                <MenuSegment
                  menu={menu}
                  onToggleStatusWithUpdateCallBack={(callBack) => {
                    changeGuard(false, callBack, `Change status of menu "${menu.name}"?`)
                  }}
                  onResetWithCallBack={(callBack) => {
                    changeGuard(false, callBack, message['MSG 48'], false)
                  }}
                  onSubmitWithSubmitCallBack={(callBack) => {
                    changeGuard(false, callBack, message['MSG 45'], false)
                  }}
                  onSuccess={() => {
                    setPopupType(PopupType.alert)
                    setPopupMessage(message["MSG 22"])
                    setPopupDisplay(true)
                    setPopupPostAlertAction(() => { return onFirstChange })
                  }}

                  subMenuParams={{
                    onToggleStatusWithUpdateCallBack: (menu, callBack) => {
                      changeGuard(false, callBack, `Change status of menu "${menu.name}"?`)
                    },

                    createFrom_onSubmitWithSubmitCallBack: (callBack) => {
                      changeGuard(false, callBack, `Add a new submenu for menu "${menu.name}"?`, false)
                    },
                  }}
                />
              //</>
            ))
          }

          {reloadWarning && <Container fluid className="p-2">
            <Message warning>
              Changes detected; please reload the page for the changes to take effect.
            </Message>
          </Container>}

          <div className="flex justify-between mb-2">
            <div>
              <Container fluid>
                <p>Showing {showingFrom} to {showingTo} of {menuList.totalItems} entries</p>

                <Button color='teal' style={{ marginRight: '3px' }} onClick={() => {
                  setPopupType(PopupType.createMenu)
                  setPopupMessage(<Header as='h2'>Create Menu</Header>)
                  setPopupDisplay(true)
                }}
                >New Menu</Button>
              </Container>
            </div>

            <div>
              <Pagination
                defaultActivePage={1}
                size='small'
                floated="right"
                totalPages={menuList.totalPages}
                activePage={menuList.currentPage}
                onPageChange={(_, p) => handlePageChange(p.activePage as number)}
              />
            </div>
          </div>



        </Segment>
      </Container>

      {popupDisplay && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex">
              {popupMessage && <div className="flex-1">{popupMessage}</div>}
              {popupType == PopupType.createMenu &&
                <Button size="mini" className="flex-none" icon="close" basic circular onClick={() => { setPopupDisplay(false); if (popupPostAlertAction) popupPostAlertAction() }} />
              }
            </div>

            <div className="mt-4 text-center">
              {
                (
                  () => {
                    switch (popupType) {
                      case PopupType.alert:
                        return (
                          <button
                            className="mx-2 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => { setPopupDisplay(false); if (popupPostAlertAction) popupPostAlertAction() }}
                          >
                            OK
                          </button>
                        )

                      case PopupType.confirmation:
                        return (
                          <>
                            <button
                              className="mx-2 px-4 py-2 bg-blue-500 text-white rounded"
                              onClick={() => {
                                if (popupConfirmAction) {
                                  popupConfirmAction()
                                }
                              }}
                            >
                              Yes
                            </button>

                            <button
                              className="mx-2 px-4 py-2 bg-red-500 text-white rounded"
                              onClick={() => { setPopupDisplay(false) }}
                            >
                              No
                            </button>
                          </>
                        )

                      case PopupType.createMenu:
                        return (
                          <>
                            <CreateForm
                              parentID={null}
                              onSuccess={() => {
                                setPopupType(PopupType.alert)
                                setPopupMessage(message["MSG 26"])
                                setPopupDisplay(true)
                              }}
                            />
                          </>
                        )
                    }
                  }
                )()
              }

            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default ListMenu
