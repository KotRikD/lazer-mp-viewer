import { SyntheticEvent, useMemo, useRef, useState } from 'react';
import { MatchesViewer } from './Components/MatchesViewer/MatchesViewer';

import _ from 'lodash';

import './App.css';

function App() {
    const [matchId, setMatchId] = useState(0);
    const [bearerToken, setBearerToken] = useState('');

    const matchIdRef = useRef<HTMLInputElement | null>(null);
    const bearerTokenRef = useRef<HTMLInputElement | null>(null);

    const onMatchIdEntered = useMemo(
        () =>
            _.debounce((e: SyntheticEvent<HTMLInputElement, Event>) => {
                const targetValue = (e.target as HTMLInputElement).value;
                if (targetValue.length > 0 && matchIdRef.current) {
                    matchIdRef.current.value = targetValue;

                    if (!Number.isNaN(Number(targetValue))) {
                        setMatchId(Number(targetValue));
                    }
                }
            }, 500),
        [matchId]
    );

    const onBearerTokenEntered = useMemo(
        () =>
            _.debounce((e: SyntheticEvent<HTMLInputElement, Event>) => {
                const targetValue = (e.target as HTMLInputElement).value;
                if (targetValue.length > 0 && bearerTokenRef.current) {
                    bearerTokenRef.current.value = targetValue;
                    setBearerToken(targetValue);
                }
            }, 500),
        [bearerToken]
    );

    return (
        <>
            <div className="ui container">
                <form className="ui form">
                    <div className="field">
                        <label>Match id</label>
                        <input
                            ref={matchIdRef}
                            onInput={onMatchIdEntered}
                            type="number"
                            name="first-name"
                            placeholder="Place here match id (ex. 1234586 <- yeah that's real lobby id)"
                        />
                    </div>
                    <div className="field">
                        <label>osu-api OAuth2 token</label>
                        <input
                            ref={bearerTokenRef}
                            onInput={onBearerTokenEntered}
                            type="password"
                            name="last-name"
                            placeholder="osu-api v2 bearer token"
                        />
                    </div>
                    Warning! all data will be proceed through bypass of CORS
                    rules on my personal domain! (I dont do anything with it,
                    but just if you're paranoic or etc)
                </form>
                {!Number.isNaN(matchId) &&
                    matchId !== 0 &&
                    bearerToken.length > 20 && (
                        <MatchesViewer
                            roomId={matchId}
                            authToken={bearerToken}
                        />
                    )}

                <div
                    className="sixteen wide column"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column'
                    }}
                >
                    <h4 className="title">
                        This will be useless when this issue will be closed
                    </h4>
                    <a
                        target="_blank"
                        href="https://github.com/ppy/osu-web/issues/10455"
                    >
                        https://github.com/ppy/osu-web/issues/10455
                    </a>
                    <span>
                        powered by old code of{' '}
                        <a href="https://github.com/osukurikku">kurikku</a>
                    </span>
                </div>
            </div>
        </>
    );
}

export default App;
