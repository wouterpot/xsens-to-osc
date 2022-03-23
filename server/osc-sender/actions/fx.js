const osc = require("../osc");

const fx = ({ fx, fxparam, track }, value) => {
    osc(`/track/${track}/fx/${fx}/fxparam/${fxparam}/value`, value);
};

module.exports = { fx };
