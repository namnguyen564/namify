import {render,screen,fireEvent,waitFor} from "@testing-library/react"
import SearchResults from "./SearchResults"

test("artist and track are displayed", () => {
    const fakeData = {
        title: "idk",
        artist: "idk again",
        albumUrl: "sadadkj"
    }

    render (
        <SearchResults track={fakeData}></SearchResults>
    )

    expect(screen.getByText(fakeData.artist)).not.toBeNull()
    expect(screen.getByText(fakeData.title)).not.toBeNull()
})

test("test handle play button", async () => {
    const fakeData = {
      title: "idk",
      artist: "idk again",
      albumUrl: "sadadkj"
    }
  
    const chooseTrackHandler = jest.fn()
  
    render (
      <SearchResults track={fakeData} chooseTrack={chooseTrackHandler}></SearchResults>
    )
  
    // await waitFor(() => {
    //   expect(screen.getByTestId("clicking-div")).toBeInTheDocument()
    // })
  
    fireEvent.click(screen.getByTestId("clicking-div"))
  
    expect(chooseTrackHandler).toHaveBeenCalled()
  })