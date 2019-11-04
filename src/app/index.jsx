import React from 'react';
import ReactDOM from 'react-dom';

(async () => {
    const {Panel} = await import('./Panel');
    const {Button} = await import('./Button');
    const root = document.getElementById('root');
    ReactDOM.render((
        <div>
            <Panel/>
            <Button>Direct</Button>
        </div>
    ), root);
})();