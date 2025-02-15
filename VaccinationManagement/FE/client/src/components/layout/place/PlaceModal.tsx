import { useEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Container,
  Form,
  FormButton,
  FormInput,
  Grid,
  GridColumn,
  GridRow,
  Header,
  Icon,
  Input,
  Menu,
  MenuItem,
  Popup,
  Segment,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "semantic-ui-react";
import PlaceService from "@/services/PlaceService";
import { PaginatedList } from "@/helpers/utils";
import { Place, PlaceQuery } from "@/types/place";
import message from '@/helpers/constants/message.json';
import FormatId from '@/helpers/constants/FormatID.json';
import { AxiosError } from "axios";

const { GetPlacesPaged, GetLatestPlace } = PlaceService
const SubmitCreateForm = PlaceService.CreatePlace
const SubmitUpdateForm = PlaceService.UpdatePlaces

enum StatusValues {
  active = "Active",
  inactive = "Inactive"
}

enum popupType {
  confirmation = 0,
  alert = 1
}

// Amount of entries per page
const defaultPageSize = 5
// const pageSizeMin = 1
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
    <TableRow>
      <TableCell colSpan={4}>
        <Header textAlign='center' as={'h2'}>{message["MSG 8"]}</Header>
      </TableCell>
    </TableRow>
  )
  return elementList
}

// using style because classes gets overriden
const headerStyle = { color: "white", borderRadius: 0 }

const pageBarSize = 7
const pageBarDisplace = Math.floor(pageBarSize / 2)

const PlaceModal = (
  params:
    {
      active?: boolean,
      onOpen?: () => void,
      onClose?: () => void,
    }
) => {
  /*
   * Handle opening and closing popup
   */
  const [popupDisplay, setPopupDisplay] = useState<boolean>(params.active ?? true);

  useEffect(() => {
    setPopupDisplay(params.active ?? true)
  }, [params.active])

  useEffect(() => {
    if (popupDisplay && params.onOpen) params.onOpen()
    if (!popupDisplay && params.onClose) params.onClose()
  }, [popupDisplay])

  const [popupInPopupDisplay, setPopupInPopupDisplay] = useState(false);
  const [popupInPopupMessage, setPopupInPopupMessage] = useState('');
  const [popupInPopupType, setPopupInPopupType] = useState<popupType>(popupType.alert);
  const [popupInPopupConfirmAction, setPopupInPopupConfirmAction] = useState<() => void>();


  /*
   * Handle page size
   */
  const pageSize = useRef(defaultPageSize)
  const handlePageSizeChange = (_pageSize: number) => {
    pageSize.current = _pageSize
    handlePageChange(1)
  }


  /*
   * Handle fetch places (paginated) and page change
   */
  const [showActive, setShowActive] = useState(true)
  const [placeList, setPlaceList] = useState<PaginatedList<Place>>({
    currentPage: 0,
    totalItems: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    list: []
  })

  const handlePageChange = (page: number) => {
    setSelectedIds([])
    GetPlacesPaged(page, pageSize.current, searchQuery, showActive).then((apiResponse) => {
      const list = apiResponse.places
      if (list && apiResponse.currentPage > 1 && list.length < 1) {
        handlePageChange(Math.max(apiResponse.totalPages, 1))
        return;
      }
      setPlaceList({ ...apiResponse, list: list });
      setDefaultEditForm(list)
    })
  }

  const showingFrom = (placeList.currentPage - 1) * pageSize.current + 1
  const showingTo = showingFrom + placeList.list.length - 1


  /*
   * Handle search
   */
  const [searchQuery, setSearchQuery] = useState('')


  /*
   * Handle Enabling/Disabling edit mode
   */
  const [editMode, setEditMode] = useState(false)


  /*
   * Handle select place
   */
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleSelect = (id: string, reset = false) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(s => s != id))
    else setSelectedIds([...selectedIds, id])

    if (reset) resetPlaceWithId(id)
  }
  const handleSelectAll = () => {
    if (selectedIds.length == placeList.list.length) setSelectedIds([])
    else setSelectedIds(placeList.list.map(pl => pl.id))
  }


  /*
   * Handle update place status
   */
  const handleUpdatePlaceStatus = async (status: boolean) => {
    const queries: PlaceQuery[] = selectedIds.map((id) => (
      {
        id: id,
        status: status
      }
    ))

    await SubmitUpdateForm(queries)
    handlePageChange(placeList.currentPage)
  }


  /*
   * Handle edit place
   */
  const [editForm, setEditForm] = useState<{ formValue: Place, default: Place, hasChanged: boolean }[]>([]);
  const validateEditForm = () => {
    return editForm.filter((entry) => entry.hasChanged)
      .map((entry) => validateEditFormEntry(entry.formValue))
      .find((valid) => !valid) ?? true
  }

  const validateEditFormEntry = (formValue: Place) => {
    return (formValue.id.length > 0) && (formValue.name.length > 0)
  }

  const hasAnyChanged = !!editForm.find((entry) => entry.hasChanged)
  const hasAnyChangedAndSelected = !!editForm.filter((editFormValue) => selectedIds.includes(editFormValue.formValue.id)).find((entry) => entry.hasChanged)

  const setDefaultEditForm = async (places: Place[]) => {
    setEditForm(places.map((place) => ({
      formValue: place,
      default: place,
      hasChanged: false
    }
    )))
  }

  const handleEditName = (id: string, name: string) => {
    setEditForm(editForm.map((editFormValue) => (editFormValue.formValue.id === id) ?
      {
        formValue: { ...editFormValue.formValue, name: name },
        default: editFormValue.default,
        hasChanged: !(editFormValue.default.name === name)
      }
      :
      editFormValue
    ))
  }
  const resetPlaceWithId = (id: string) => {
    setEditForm(editForm.map((editFormValue) => (editFormValue.formValue.id === id) ?
      {
        formValue: editFormValue.default,
        default: editFormValue.default,
        hasChanged: false
      }
      :
      editFormValue
    ))
  }
  const handleResetEditForm = () => {
    setEditForm(editForm.map((editFormValue) => (selectedIds.includes(editFormValue.formValue.id)) ?
      {
        formValue: editFormValue.default,
        default: editFormValue.default,
        hasChanged: false
      }
      :
      editFormValue
    ))
  }

  const handleSubmitEditForm = async () => {
    if (validateEditForm()) {
      try {
        // console.log(validateEditForm())
        await SubmitUpdateForm(editForm
          .filter(
            (editFormValue) =>
              editFormValue.hasChanged &&
              selectedIds.includes(editFormValue.formValue.id))
          .map((entry) => entry.formValue))
        handlePageChange(placeList.currentPage)
      }
      catch (err) {
        console.log(err)
      }
    }
  }


  /*
   * Page bar
   */
  let pageBarRange = [...Array(pageBarSize).keys()].map(i => i + placeList.currentPage - pageBarDisplace)

  const low = pageBarRange[0]
  if (low < 1) pageBarRange = pageBarRange.map(i => i - low + 1)
  const high = pageBarRange[pageBarRange.length - 1]
  if (high > placeList.totalPages) pageBarRange = pageBarRange.map(i => i - (high - placeList.totalPages))


  /*
   * Handle create place
   */
  const [createForm, setCreateForm] = useState<Place>({
    id: 'Latest Id',
    name: '',
    status: true
  });
  const validateCreateForm = () => {
    return (createForm.id.length > 0) && (createForm.name.length > 0)
  }

  const handleChangeName = (name: string) => {
    setCreateForm({ ...createForm, name: name })
  }

  const searchPlace = async (name: string) => {
    const response = await GetPlacesPaged(1, 1, name, undefined, true)
    return (response.places.length > 0) ? response.places[0] : undefined
  }

  const handleSubmitCreate = async () => {
    if (validateCreateForm()) {
      try {
        await SubmitCreateForm(createForm)
        setCreateForm({ ...createForm, id: await getLatestPlaceId() })
        handlePageChange(placeList.currentPage)
      }
      catch (err) {
        console.log(err)
      }
    }
  }


  /*
   * Initial render
   */
  const getLatestPlaceId = async () => {
    try {
      const apiResponse = await GetLatestPlace()
      const preFix: string = apiResponse.id.substring(0, 2)
      const surFix: string = apiResponse.id.substring(2)
      return preFix + ((parseInt(surFix) + 1) + '').padStart(surFix.length, '0')
    }
    catch (err) {
      if (err instanceof AxiosError && err.status == 404) {
        const id = FormatId["Place"]
        const preFix: string = id.substring(0, 2)
        const surFix: string = id.substring(2)
        return preFix + ((parseInt(surFix) + 1) + '').padStart(surFix.length, '0')
      }
      // panik
      console.log(err)
      return ''
    }
  }


  const refreshList = () => {
    handlePageChange(1)
    const initPlaceForm = async () => setCreateForm({ ...createForm, id: await getLatestPlaceId() })
    initPlaceForm()
  }

  // javascript, amirite lads?
  /* so, basically, this method is used to wrap around another function and only call that function if a condition 
   * is met (for example, either the form has not been edited, or the use agrees to ignore the changes and reset).
   * However, if your function takes data from a reference (like e.target.value, for example), you can't just throw 
   * something like () => setThing(e.target.value) in there because once a redraw is trigged, e.target.value
   * resets back to before events, like onChange and such, is fired (if you do something like set value={thing}), 
   * meaning that setThing(e.target.value) will just be equivalent to setThing(thing), which is useless.
   * So that's why the params shenanigan is here. Use it if you need to dereference anything.
   */
  const changeGuard = <T,>(condition: boolean, action: (params?: T) => void, message: string, params?: T) => {
    if (condition) action(params)
    else {
      setPopupInPopupType(popupType.confirmation)
      setPopupInPopupMessage(message)
      setPopupInPopupConfirmAction(() => () => { setPopupInPopupDisplay(false); action(params); })
      setPopupInPopupDisplay(true)
    }
  }

  const guardedPageChage = (page: number) => {
    changeGuard(!hasAnyChanged, () => handlePageChange(page), message["MSG 47"])
  }

  useEffect(() => {
    refreshList()
  }, [searchQuery, showActive])

  // Should the user be able to reset the edit form
  const resetCondition = hasAnyChangedAndSelected

  // Should the user be able to submit the edit form
  // hasAnyChangedAndSelected() && validateEditForm() but squeezed a bit of efficiency
  const saveCondition = resetCondition && validateEditForm()


  return (
    <>
      {popupDisplay && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">

            <Container>
              <Header as='h2' textAlign="center">MANAGE LOCATIONS
                <Button basic floated="right" circular onClick={() => { setPopupDisplay(false) }}>
                  X
                </Button>
              </Header>
              <Segment>
                <div className="flex justify-between mb-2">
                  <div>
                    <label htmlFor="entries" className="mr-2">Show</label>
                    <select
                      name="entries"
                      className="border rounded p-1"
                      onChange={(e) => {
                        changeGuard<number>(!hasAnyChanged, (num) => {
                          console.log(num)
                          handlePageSizeChange(num ?? 1)
                        }, message["MSG 47"], parseInt(e.target.value))
                      }}
                      value={pageSize.current}
                    >
                      {pageSizeOptions.map((op) => <option value={op.value}>{op.text}</option>)}
                    </select> entries
                  </div>

                  <div className="flex items-center space-x-4">
                    <div style={{ height: "1rm", lineHeight: "1rm", textAlign: "center", float: "left" }}>Active</div>
                    <Checkbox toggle style={{ float: "right" }} checked={showActive} onClick={() => changeGuard(!hasAnyChanged, () => setShowActive(!showActive), message["MSG 47"])} readOnly />

                    <div className="relative">
                      <Input
                        size='mini'
                        icon={"search"}
                        iconPosition='left'
                        placeholder='Search...'
                        value={searchQuery}
                        onChange={(_, v) => changeGuard(!hasAnyChanged, () => setSearchQuery(v.value), message["MSG 47"])}
                      />
                    </div>
                  </div>
                </div>

                <div className={"my-2"} style={{ maxHeight: "30vh", overflowY: "auto" }}>

                  <Table striped basic={"very"} style={{ borderRadius: 0 }}>
                    <TableHeader style={{ backgroundColor: "#43a047", position: "sticky", top: 0, zIndex: 2 }}>
                      <TableRow style={{ color: "white" }}>
                        <TableHeaderCell style={headerStyle} collapsing>
                          <Checkbox checked={selectedIds.length == placeList.list.length} onClick={handleSelectAll} />
                        </TableHeaderCell>
                        <TableHeaderCell style={headerStyle}>Id</TableHeaderCell>
                        <TableHeaderCell style={headerStyle}>Name</TableHeaderCell>
                        <TableHeaderCell style={headerStyle}>Status</TableHeaderCell>
                      </TableRow>
                    </TableHeader>

                    <TableBody >
                      {
                        listOrDefault(
                          editForm.map(
                            (editFormValue) => {
                              const isSelected = selectedIds.includes(editFormValue.formValue.id)
                              return <TableRow style={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell>
                                  <Checkbox checked={isSelected} onClick={() => changeGuard(
                                    !(isSelected && editFormValue.hasChanged),
                                    () => handleSelect(editFormValue.formValue.id, isSelected && editFormValue.hasChanged),
                                    "Stop editing \"" + editFormValue.default.name + "\"? Its value will reset back to default."
                                  )} />
                                </TableCell>

                                <TableCell collapsing>{editFormValue.formValue.id}</TableCell>

                                <TableCell
                                  warning={editFormValue.hasChanged}
                                  style={(editMode && isSelected) ? { border: "0.8px solid #d5d7e0", backgroundColor: "white" } : {}}
                                >
                                  <Input
                                    transparent
                                    fluid
                                    readOnly={!(editMode && isSelected)}
                                    placeholder={editFormValue.formValue.name}
                                    value={editFormValue.formValue.name}
                                    onChange={(_, v) => handleEditName(editFormValue.formValue.id, v.value)}
                                  />
                                </TableCell>

                                <TableCell collapsing>
                                  {(editFormValue.formValue.status) ? StatusValues.active : StatusValues.inactive}
                                </TableCell>
                              </TableRow>
                            }
                          )
                        )
                      }
                    </TableBody>
                  </Table>
                </div>

                <Grid>
                  <GridRow>
                    <GridColumn width={10}>
                      <Container fluid>
                        <div>Showing {showingFrom} to {showingTo} of {placeList.totalItems} entries
                          <Checkbox
                            label={"Edit mode"}
                            checked={editMode}
                            onClick={() => setEditMode(!editMode)}
                            style={{ float: "right" }}
                          >
                          </Checkbox>
                        </div>

                        <Button
                          color='teal'
                          className="me-1"
                          disabled={selectedIds.length < 1}
                          onClick={() => changeGuard(!(selectedIds.length), () => handleUpdatePlaceStatus(!showActive), (hasAnyChanged) ? message["MSG 47"] : message["MSG 45"])}
                        >
                          Make {(showActive) ? "inactive" : "active"}
                        </Button>

                        {editMode && <Popup content={
                          // Can be shortened. Kept for semantic purpose
                          (!resetCondition) ? "Please select and edit at least 1 item to save" :
                            (!saveCondition) ? "One or more items in the table is invalid" : ""
                        }
                          disabled={saveCondition}
                          trigger={
                            <Container style={{ display: "inline" }}>
                              <Button
                                color='blue'
                                className="me-1"
                                onClick={() => changeGuard(false, handleSubmitEditForm, message["MSG 45"])}
                                disabled={!saveCondition}
                              >
                                Save
                              </Button>
                            </Container>
                          } />
                        }


                        {editMode &&
                          <Popup content='Please select and edit at least 1 item to reset'
                            disabled={resetCondition}
                            trigger={
                              <Container style={{ display: "inline" }}>
                                <Button
                                  color="red"
                                  disabled={!resetCondition}
                                  onClick={() => changeGuard(false, handleResetEditForm, message["MSG 44"])}
                                >
                                  Reset
                                </Button>
                              </Container>
                            } />
                        }

                      </Container>
                    </GridColumn>

                    <GridColumn width={5} floated="right">
                      <Menu floated='right' pagination>
                        <MenuItem as='a' icon disabled={!placeList.hasPreviousPage} onClick={() => guardedPageChage(placeList.currentPage - 1)}> <Icon name='chevron left' /> </MenuItem>
                        {
                          pageBarRange.map((page) => {
                            if (page == placeList.currentPage) return <MenuItem as='a'><Header as={'h3'}>{page}</Header></MenuItem>
                            if (page > 0 && page <= placeList.totalPages) return <MenuItem as='a' onClick={() => guardedPageChage(page)}>{page}</MenuItem>
                          })
                        }
                        <MenuItem as='a' icon disabled={!placeList.hasNextPage} onClick={() => guardedPageChage(placeList.currentPage + 1)}> <Icon name='chevron right' /> </MenuItem>
                      </Menu>
                    </GridColumn>
                  </GridRow>
                </Grid>
              </Segment>
            </Container>

            <Container className="mt-1">
              <Segment>
                <p></p>
                <Form onSubmit={
                  async () => {
                    const place = await searchPlace(createForm.name)
                    if (place) {
                      setPopupInPopupType(popupType.alert)
                      setPopupInPopupMessage(message["MSG 49"] + " (existing place's id: " + place.id + ")")
                      setPopupInPopupDisplay(true)
                    }
                    else changeGuard(false, handleSubmitCreate, "Add a new location named \"" + createForm.name + "\"?")
                  }
                }>
                  <Grid>
                    <GridRow>
                      <GridColumn width={7}>
                        <FormInput
                          label={'Id'}
                          name='id'
                          value={createForm.id}
                          readOnly
                        />
                      </GridColumn>

                      <GridColumn width={7}>
                        <FormInput
                          label={'Name'}
                          name='name'
                          placeholder='Enter name'
                          value={createForm.name}
                          onChange={(e) => handleChangeName(e.target.value)}
                        />
                      </GridColumn>

                      <GridColumn width={2} verticalAlign="bottom">
                        <FormButton disabled={createForm.name.length < 1} color="blue">Add</FormButton>
                      </GridColumn>
                    </GridRow>
                  </Grid>
                </Form>
              </Segment>
            </Container>

            {popupInPopupDisplay && (
              <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50 z-10">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <p>{popupInPopupMessage}</p>
                  <div className="mt-4 text-center">
                    {(popupInPopupType == popupType.alert) ?
                      <button
                        className="mx-2 px-4 py-2 bg-blue-500 text-white rounded"
                        onClick={() => { setPopupInPopupDisplay(false) }}
                      >
                        OK
                      </button>
                      :
                      <>
                        <button
                          className="mx-2 px-4 py-2 bg-blue-500 text-white rounded"
                          onClick={() => {
                            if (popupInPopupConfirmAction) {
                              popupInPopupConfirmAction()
                            }
                          }}
                        >
                          Yes
                        </button>

                        <button
                          className="mx-2 px-4 py-2 bg-red-500 text-white rounded"
                          onClick={() => { setPopupInPopupDisplay(false) }}
                        >
                          No
                        </button>
                      </>
                    }

                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}

export default PlaceModal
