import { useState } from 'react';
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import EditButton from '../buttons/EditButton';
import DeleteButton from '../buttons/DeleteButton';
import FreqList from '../misc/FreqList';
import YouTube from 'react-youtube';
import { Trans } from '@lingui/macro'
import DeleteWarning from '../pop-ups/DeleteWarning';
import { IoRocketSharp } from 'react-icons/io5';

import Database from "../../services/db";
const db = new Database();

const TrickDetails = () => {

  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  const { id } = useParams();

  const navigate = useNavigate();

  const trick = useLiveQuery(async () => {
    const dbTrick = await db.getTrick(id);
    const resolvedRecommendations = [];

    if (!dbTrick || !dbTrick.id) return null;

    if (dbTrick.recommendedPrerequisites && dbTrick.recommendedPrerequisites.map) {
      await Promise.all (dbTrick.recommendedPrerequisites.map (async recommendedId => {
        resolvedRecommendations.push(await db.getTrick(recommendedId));
      }));
    }

    dbTrick.recommendedPrerequisites = resolvedRecommendations;
    return dbTrick;
  }, [id]);

  if (!trick) return <>Trick id: {id} not found in database</>;

  console.log(trick);

  const selectFreq = (e) => {
    const newFreq = Number(e.target.value);
    let modifiedTrick = Object();
    modifiedTrick.id = trick.id;
    modifiedTrick.stickFrequency = newFreq;
    db.saveTrick(modifiedTrick).then(res => {
      console.log("changed stickFrequency");
    }).catch(e => {
      console.log(e);
    });
  }

  let youtubeId;
  let youtubeOpts;
  var instagramLink
  if (trick && trick.linkToVideo) {
    if (trick.linkToVideo.includes("youtu")) {
      // "https://www.youtube.com/embed/<videoID>"
      if (trick.linkToVideo.includes("youtu.be")) {
        youtubeId = trick.linkToVideo.split("/").pop().split("?")[0];
      } else {
        youtubeId = trick.linkToVideo.split("/").pop().split("?v=").pop();
        if (youtubeId.includes("&")) {
          youtubeId = youtubeId.split("&")[0];
        }
      }
      youtubeOpts = {
        playerVars: {
          autoplay: 0,
          fs: 1,
          rel: 0,
          start: trick.videoStartTime,
          end: trick.videoEndTime
        }
      }
    }
    else if (trick.linkToVideo.includes("instagram")) {
      // "https://www.instagram.com/p/<videoID>/embed
      instagramLink = trick.linkToVideo + "embed";
    }
    else {
      console.log("Could not embed this link:\n" + trick.linkToVideo);
    }
  }

  const setupYoutubePlayer = (e) => {
    e.target.mute();
  }

  const restartVideo = (e) => {
    e.target.seekTo(trick.videoStartTime ?? 0);
  }

  const editTrick = () => navigate("/posttrick",{state: {preTrick:trick}});

  const deleteTrick = () => {
    db.deleteTrick(id)
      .then(() => {
        console.log("trick deleted");
      })
      .catch(e => {
        console.log(e);
      });

    navigate('/');
  };

  const toggleBoostSkill = () => {
    trick.boostSkill ? trick.boostSkill = false : trick.boostSkill = true;
    db.saveTrick(trick).then(res => {
      console.log("changed boost");
    }).catch(e => {
      console.log(e);
    });
  }

  function TipList(props) {
    const listItems = props.tips.map(tip =>
      <li key={tip}>{tip}</li>
    );
    return (<ul className="callout">{listItems}</ul>);
  }

  /**
   * Determine the color for the difficultyLevel badge. This is done by lerping between two colors.
   */
  const difficultyBadgeColor = useLiveQuery(async () => {
    const dbTrick = await db.getTrick(id);

    const difficulties = (await db.getAllTricks()).map(trick => trick.difficultyLevel)
    const minDifficulty = Math.min(...difficulties)
    const maxDifficulty = Math.max(...difficulties)
    const minColor = [194, 80, 40]  //HSL
    const maxColor = [0, 100, 40]   //HSL

    const clampedDifficulty = Math.max(minDifficulty, Math.min(dbTrick.difficultyLevel, maxDifficulty))
    const percent = (clampedDifficulty - minDifficulty) / (maxDifficulty - minDifficulty)

    const color = []
    for (let i = 0; i < 3; i++) {
      color.push(Math.floor(minColor[i] * (1 - percent) + maxColor[i] * percent))
    }
    return `hsl(${color[0]}deg ${color[1]}% ${color[2]}%)`
  }, [id], "#666666")

  if (!trick) return null;

  return (
    <div className="trick-details container-lg px-1">
      {trick && (
        <article>
          <div className="mt-2 mb-3 py-0">
            <div className="row align-items-start justify-content-between my-0">
              <div className="col-8 col-sm-9 col-md-10">
                <h1 className="fw-bold my-0" align="left">
                  {trick.alias || trick.technicalName}
                </h1>
                {trick.alias && trick.technicalName &&
                    <h2 className="text-muted fs-3 mb-0 mt-1">{trick.technicalName}</h2>
                }
              </div>

              <div className="col-2 col-sm-2 col-md-1 my-0" align="center">
                <EditButton className="align-top" call={editTrick}/>
              </div>

            <div className="col-3" align="right">
              <DeleteButton setShowDeleteWarning={setShowDeleteWarning}/>
            </div>
          </div>
          {trick.alias && trick.technicalName &&
            <div>
              <h6>Technical Name: </h6>
              <div className="callout">{trick.technicalName}</div>
            </div>
          }
              <div className="col-2 col-sm-1 col-md-1 my-0" align="right">
                <DeleteButton setShowDeleteWarning={setShowDeleteWarning}/>
              </div>
            </div>
          </div>

          {trick.startPos && trick.endPos &&
            <div>
              <div className="callout">from {trick.startPos} to {trick.endPos}</div>
            </div>
          }

          {(trick.difficultyLevel >= 0) &&
            <div>
              <h6><Trans id="trickDetails.level">Level</Trans>: </h6>
              <div className="callout">{trick.difficultyLevel}</div>
            </div>
          }

          {trick.description &&
            <div>
              <h6>Description: </h6>
              <div className="callout">{trick.description}</div>
            </div>
          }

          {trick.tips && trick.tips.length > 0 &&
            <div>
              <h6>Tips: </h6>
              <TipList tips={trick.tips} />
            </div>
          <div className="row justify-content-start">
            {trick.startPos && trick.endPos &&
                <div className="col-auto mt-0 mb-3 me-4">from {trick.startPos} to {trick.endPos}</div>
            }
            {(trick.difficultyLevel >= 0) &&
                <div className="col-auto" align="left">
                  <p className="badge" style={{background: difficultyBadgeColor}}>
                    <Trans id="trickDetails.level">Difficulty</Trans> {trick.difficultyLevel}
                  </p>
                </div>
            }
          </div>

          <hr className="my-1"/>

          {trick.description &&
              <div className="my-3">{trick.description}</div>
          }

          {trick.yearEstablished && trick.establishedBy &&
              <p className="">Established by {trick.establishedBy} in {trick.yearEstablished}</p>
            <div>
              <h6>Established by: </h6>
              <div className="callout">{trick.establishedBy} in {trick.yearEstablished}</div>
            </div>
          }

          {youtubeId &&
            <div className="ratio ratio-16x9">
              <YouTube className="video" videoId={youtubeId} opts={youtubeOpts} onReady={setupYoutubePlayer} onEnd={restartVideo}/>
            </div>
          }
          {instagramLink &&
            <div align="center">
              <iframe className="insta-video" src={instagramLink} frameBorder="0" scrolling="no" allowtransparency="true" title="video"></iframe>
            </div>
          }

          {(trick.tips || trick.recommendedPrerequisites.length !== 0) &&
            <hr className="my-3"/>
          }

          {trick.tips &&
              <div>
                <h5 className="text-muted">Tips</h5>
                <div className="">{trick.tips}</div>
              </div>
          }

          {trick.recommendedPrerequisites.length !== 0 &&
              <div className={trick.tips ? "mt-3" : ""}>
                <div className="row">
                  <h5 className="text-muted">Recommended Prerequisites</h5>
                  {trick.recommendedPrerequisites.map(recommendedTrick => {
                  if(recommendedTrick){
                    return (
                        <div key={recommendedTrick.id} className="trick-container col-12">
                          <button className="btn trick-preview skillFreq" freq={recommendedTrick.stickFrequency} onClick={() => {navigate(`/tricks/${recommendedTrick.id}`);}}>
                            {recommendedTrick.alias || recommendedTrick.technicalName}
                            {recommendedTrick.boostSkill && (
                              <>
                              <br/>
                              <IoRocketSharp />
                              </>)}
                          </button>
                        </div>
                    );
                  }})}
                </div>
              </div>
            <div className="row">
              <h6>Recommended Prerequisites:</h6>
              {trick.recommendedPrerequisites.map(recommendedTrick => {
              if(recommendedTrick){
                return (
                    <div key={recommendedTrick.id} className="trick-container col-12">
                      <button className="btn preview-item skillFreq" freq={recommendedTrick.stickFrequency} onClick={() => {navigate(`/tricks/${recommendedTrick.id}`);}}>
                        {recommendedTrick.alias || recommendedTrick.technicalName}
                        {recommendedTrick.boostSkill && (
                          <>
                          <br/>
                          <IoRocketSharp />
                          </>)}
                      </button>
                    </div>
                );
              }})}
            </div>
          }

          <hr className="my-3"/>

          <div className="row">
            <h5 className="text-muted">Your success frequency:</h5>
            <div onChange={selectFreq}>
              <FreqList stickable={trick}/>
            </div>
          </div>

          <div className="boostSkill row justify-content-center">
            <button
                className={trick.boostSkill ? "col-8 col-lg-3 col-xl-2 btn btn-warning" : "col-8 col-lg-3 col-xl-2 btn btn-primary" }
                onClick={toggleBoostSkill}>
              {trick.boostSkill
                  ? "Unboost"
                  : <><IoRocketSharp style={{fill: "white"}}/> Boost</>
              }
            </button>
          </div>

          {showDeleteWarning && <DeleteWarning showDeleteWarning={showDeleteWarning} setShowDeleteWarning={setShowDeleteWarning} itemName={trick.alias || trick.technicalName} call={deleteTrick} />}
        </article>
      )}
    </div>
  );
}

export default TrickDetails;
