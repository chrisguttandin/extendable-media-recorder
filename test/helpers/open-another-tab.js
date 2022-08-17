export const openAnotherTab = () => {
    const handle = window.open(location.href, '_blank');

    let stop;
    let timeout = setTimeout(() => {
        handle.close();

        timeout = setTimeout(() => {
            stop = openAnotherTab();
        }, 1000);
        stop = () => clearTimeout(timeout);
    }, 1000);

    stop = () => {
        clearTimeout(timeout);
        handle.close();
    };

    return () => stop();
};
