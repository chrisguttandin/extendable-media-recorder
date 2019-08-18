export const createMediaStreamWithVideoTrack = () => {
    const canvasElement = document.createElement('canvas');

    // @todo https://bugzilla.mozilla.org/show_bug.cgi?id=1388974
    canvasElement.getContext('2d');

    return canvasElement.captureStream();
};
