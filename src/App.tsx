import logo from './assets/logo.svg';
import './App.css';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import swal from 'sweetalert';
import { getUsersSavedTracks } from './lib/spotify/api/tracks/tracks';
import { AxiosRequestConfig } from 'axios';

const apiToken =
  'BQBewu5upiqpbJyov-q7eUh3MuG-nHsDPYMpUnT0DlZyuKzbTjiv4wA-3rufncOfCsBzXfmycogGIdRz-Yx0XGUPCVwBtqd_5yqWjoVFModkWruot---h2AFIADauL8mD9Kk0vIID7cJADPJ-3tpOEu0JG5FD3u8x95_M0kC4eMhIhbjTCOXt5mY99XfMxpXnbU-5EqpM5E5iqHVYesnxDUJE7uxyi6JkiaNtecPf55jNBJ1j9wGsnSjVGzSnbzk7uwjeMWapgzi8LQzffFo5NHdS4y5MG7bNNmkYYzhMrWiwkGQ3sTjsGnGSN78YYsKoFMMiOLUkFDbfeFbJe1Kgd7X5ruHm7g';

//const fetchTracks = async () => {
//  const response = await fetch('https://api.spotify.com/v1/me/tracks', {
//    method: 'GET',
 //   headers: {
 //     Authorization: 'Bearer ' + apiToken,
//    },
//  });

const fetchTracks = async () => {
  const options: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${apiToken}`
    }
  };
  const result = await getUsersSavedTracks(undefined, options);
  return result.data;
};

//if (!response.ok) {
//    throw new Error(`Fetching tracks failed with status ${response.status}`);
//  }
//  const data = (await response.json()) as { items: any[] };

//  return data.items;
//};

const pickRandomTrack = (tracks: any[]) => {
  return tracks[Math.floor(Math.random() * tracks.length)]!;
};

const shuffleArray = (tracks: any[]) => {
  return tracks.sort(() => Math.random() - 0.5);
};

const AlbumCover = ({ track }: { track: any }) => {
  return (
    <img
      src={track.album.images?.[0]?.url ?? ''}
      style={{ width: 200, height: 200 }}
    />
  );
};

const TrackButton = ({
  track,
  onClick,
}: {
  track: any;
  onClick: () => void;
}) => {
  return (
    <div className="App-track-button">
      <AlbumCover track={track.track} />
      <button onClick={onClick}>{track.track?.name}</button>
    </div>
  );
};

const App = () => {
  const {
    data: tracks,
    isSuccess,
    isLoading,
  } = useQuery({ queryKey: ['tracks'], queryFn: fetchTracks });

  const [currentTrack, setCurrentTrack] = useState<any | undefined>(
    undefined,
  );
  const [trackChoices, setTrackChoices] = useState<any[]>([]);

  useEffect(() => {
    if (!tracks) {
      return;
    }

    const rightTrack = pickRandomTrack(tracks);
    setCurrentTrack(rightTrack);

    const wrongTracks = [pickRandomTrack(tracks), pickRandomTrack(tracks)];
    const choices = shuffleArray([rightTrack, ...wrongTracks]);
    setTrackChoices(choices);
  }, [tracks]);

  const checkAnswer = (track: any) => {
    if (track.track?.id == currentTrack?.track?.id) {
      swal('Bravo !', "C'est la bonne réponse", 'success');
    } else {
      swal('Dommage !', "Ce n'est pas la bonne réponse", 'error');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Bienvenue sur le blind test</h1>
      </header>
      <div className="App-images">
        {isLoading || !isSuccess ? (
          'Loading...'
        ) : (
          <div>
            <div>
              <audio
                src={currentTrack?.track?.preview_url ?? ''}
                controls
                autoPlay
              />
            </div>
          </div>
        )}
      </div>
      <div className="App-buttons">
        {trackChoices.map(track => (
          <TrackButton track={track} onClick={() => checkAnswer(track)} />
        ))}
      </div>
    </div>
  );
};

export default App;
