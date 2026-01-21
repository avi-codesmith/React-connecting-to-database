import { useRef, useState, useCallback, useEffect } from "react";

import Places from "./components/Places.jsx";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";
import logoImg from "./assets/logo.png";
import AvailablePlaces from "./components/AvailablePlaces.jsx";
import { fecthUserPlaces, updatedUserPlaces } from "./components/http.js";
import Error from "./components/Error.jsx";

function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);
  const [isfetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  const [errorUpdateMessage, setErrorUpdateMessage] = useState();

  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    async function fecthplaces() {
      setIsFetching(true);
      try {
        const places = await fecthUserPlaces();
        setUserPlaces(places);
      } catch (error) {
        setError({ message: error.message || "Failed to fetch user places." });
      }
      setIsFetching(false);
    }
    fecthplaces();
  }, []);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      await updatedUserPlaces([selectedPlace, ...userPlaces]);
    } catch (error) {
      setUserPlaces(userPlaces);
      setErrorUpdateMessage({
        message: error.message || "Failed to update places",
      });
    }
  }

  const handleRemovePlace = useCallback(async () => {
    const updatedPlaces = userPlaces.filter(
      (place) => place.id !== selectedPlace.current.id
    );

    setUserPlaces(updatedPlaces);

    try {
      await updatedUserPlaces(updatedPlaces);
    } catch (error) {
      setUserPlaces(userPlaces);
      setErrorUpdateMessage({
        message: error.message || "Failed to update",
      });
    }

    setModalIsOpen(false);
  }, [userPlaces]);

  function handleError() {
    setErrorUpdateMessage(null);
  }

  return (
    <>
      <Modal open={errorUpdateMessage} onClose={handleError}>
        {errorUpdateMessage && (
          <Error
            title="An error Ocured"
            message={errorUpdateMessage.message}
            onConfirm={handleError}
          />
        )}
      </Modal>

      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="An error occurred" message={error.message} />}
        {!error && (
          <Places
            title="I'd like to visit ..."
            fallbackText="Select the places you would like to visit below."
            places={userPlaces}
            isLoading={isfetching}
            loadingText="Loading..."
            onSelectPlace={handleStartRemovePlace}
          />
        )}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
