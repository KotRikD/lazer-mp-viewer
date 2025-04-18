import React from 'react';
import moment from 'moment';
import { v2_rooms_details, v2_rooms_scores_all } from 'osu-api-extended';

import './MatchesViewer.css';
import useSWR from 'swr';

interface IMatchesViewerProps {
    roomId: number;
    authToken: string;
}

interface IMatchesPlaylistViewerProps {
    roomId: number;
    playlistId: number;
    playlistData: v2_rooms_details.Playlist;
    authToken: string;
}

const formatNumber = (num: number) => {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};

const resolverTypes = (
    type: 'gamemode' | 'gametype' | 'gamecondition' | 'gamemodtype',
    data: number
) => {
    switch (type) {
        case 'gamemode':
            switch (data) {
                case 0:
                    return 'osu';
                case 1:
                    return 'taiko';
                case 2:
                    return 'fruits';
                case 3:
                    return 'mania';
                default:
                    return 'osu';
            }
        case 'gametype':
            switch (data) {
                case 0:
                    return 'Head-to-Head';
                case 1:
                    return 'Tag Coop';
                case 2:
                    return 'Team VS';
                default:
                    return 'Tag Team VS';
            }
        case 'gamecondition':
            switch (data) {
                case 0:
                    return 'Score V1';
                case 1:
                    return 'Accuracy';
                case 2:
                    return 'Combo';
                default:
                    return 'Score V2';
            }
        case 'gamemodtype':
            switch (data) {
                case 0:
                    return 'Selected Mods';
                default:
                    return 'Free Mods';
            }
        default:
            return null;
    }
};

const getFetcher = (authToken: string) => (url: string) =>
    fetch(url, {
        headers: {
            Authorization: `Bearer ${authToken}`
        }
    }).then((res) => res.json());

const useLazerRooms = (roomId: number, authToken: string) =>
    useSWR(
        `https://cors.kotrik.ru/https://osu.ppy.sh/api/v2/rooms/${roomId}`,
        getFetcher(authToken)
    );

const useLazerRoomsPlaylist = (
    roomId: number,
    playlistId: number,
    authToken: string
) =>
    useSWR(
        `https://cors.kotrik.ru/https://osu.ppy.sh/api/v2/rooms/${roomId}/playlist/${playlistId}/scores`,
        getFetcher(authToken)
    );

const MatchesPlaylistViewer: React.FC<IMatchesPlaylistViewerProps> = ({
    roomId,
    playlistData,
    playlistId,
    authToken
}) => {
    const { data, error, isLoading } = useLazerRoomsPlaylist(
        roomId,
        playlistId,
        authToken
    );

    if (isLoading)
        return (
            <div className="ui active dimmer">
                <div className="ui text loader">
                    Playlist resolving in progress
                </div>
            </div>
        );

    if (error) return <>error happend!</>;

    return (
        <>
            <div className="ui raised segment MatchesViewer--game">
                <div
                    className="MatchesViewer--game--header"
                    style={{
                        backgroundImage: `url(${playlistData.beatmap.beatmapset.covers['card@2x']})`
                    }}
                >
                    <div className="MatchesViewer--game--header--shadow">
                        <div className="header--top">
                            <div className="ui label">
                                {resolverTypes(
                                    'gamemode',
                                    playlistData.ruleset_id
                                )}
                            </div>
                        </div>
                        <div className="header--bottom">
                            <a
                                target="_blank"
                                href={`https://osu.ppy.sh/b/${playlistData.beatmap.id}`}
                                className="Beatmap--name"
                            >
                                {playlistData.beatmap.beatmapset.artist} -{' '}
                                {playlistData.beatmap.beatmapset.title}
                            </a>
                            <span className="Beatmap--diff">
                                [{playlistData.beatmap.version}]
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="MatchesViewer--game--scores">
                {data.scores.map(
                    (item: v2_rooms_scores_all.Score, idx: number) => (
                        <div
                            className={`MatchesViewer--game--scores-segment ui ${idx === 0 ? 'yellow' : idx === 1 ? 'grey' : idx === 2 ? 'orange' : ''} segment`}
                            key={'score' + item + idx}
                        >
                            <div className="MatchesViewer--game--scores--left">
                                <div className="MatchesViewer--game--scores--container--row">
                                    <img
                                        className="avatar"
                                        src={`https://a.ppy.sh/${item.user_id}`}
                                        alt="user avatar"
                                    />
                                    <div className="MatchesViewer--game--scores--container--row">
                                        <a
                                            href={`https://osu.ppy.sh/u/${item.user_id}`}
                                            className="MatchViewer--info"
                                        >
                                            {item.user.username}{' '}
                                            <span className="mods">
                                                {item.mods.map(
                                                    (mod) => `${mod.acronym} `
                                                )}
                                            </span>
                                            {!item.passed ? (
                                                <span className="failed">
                                                    Failed
                                                </span>
                                            ) : null}
                                        </a>
                                        <i
                                            className={`${item.user.country.code.toLowerCase()} flag`}
                                        />
                                        (started at: {moment(item.started_at).format('MMMM Do YYYY, h:mm:ss a')}, ended at: {moment(item.ended_at).format('MMMM Do YYYY, h:mm:ss a')})
                                    </div>
                                </div>
                            </div>
                            <div className="MatchesViewer--game--scores--right">
                                <p>
                                    score{' '}
                                    <span className="big">
                                        {formatNumber(item.total_score)}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )
                )}
            </div>
            <div className="ui divider" />
        </>
    );
};

const MatchesViewer: React.FC<IMatchesViewerProps> = ({
    roomId,
    authToken
}) => {
    const { data, error, isLoading } = useLazerRooms(roomId, authToken);

    if (isLoading)
        return (
            <div className="ui active dimmer">
                <div className="ui text loader">
                    Match resolving in progress
                </div>
            </div>
        );

    if (error) return <>error happend!</>;

    console.log(data.playlist);

    return (
        <div className="ui raised segment MatchesViewer--wrapper">
            <h2 className="sixteen wide column title">
                {data.name} (id: {data.id})
            </h2>
            <h4 className="sixteen wide column subtitle">
                {moment(data.starts_at).fromNow()}
            </h4>
            {data.playlist.map((playlist: any) => (
                <MatchesPlaylistViewer
                    key={playlist.id}
                    playlistData={playlist}
                    roomId={roomId}
                    playlistId={playlist.id}
                    authToken={authToken}
                />
            ))}
        </div>
    );
};

export {
    MatchesViewer
    // MatchesPlaylistViewer
};
