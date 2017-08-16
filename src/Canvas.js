import React, { Component } from 'react';
import * as d3 from "d3";
import Web3 from 'web3';
import './Canvas.css';

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

//TODO: remove
window.web3 = web3;
window.d3 = d3;

const BLOCK_WIDTH = 200;
const BLOCK_HEIGHT = 300;
const NUM_BLOCKS_TO_FETCH = 4;
const NUM_BLOCKS_TO_DISPLAY = 4;
const GET_BLOCKS_INTERVAL_MS = 1000;

class Canvas extends Component {
    constructor(props){
        super(props);
        this.state = {
            blockNum: 0,
            blocks: {},
            getBlockInterval: () => {},
            gettingBlocks: false,
        };
        this.drawBlockchain = this.drawBlockchain.bind(this);
        this.getBlocks = this.getBlocks.bind(this);
    }

    componentDidMount() {
        this.getBlocks();
        this.drawBlockchain();
        const getBlockInterval = window.setInterval(this.getBlocks, GET_BLOCKS_INTERVAL_MS);
        this.setState({
            getBlockInterval,
        });

    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.blockNum < nextState.blockNum;
    }

    componentDidUpdate() {
        this.drawBlockchain();
    }

    async getBlocks() {
        console.log('getting blocks..', this.state.gettingBlocks);
        // Return if already fetching new blocks
        if (this.state.gettingBlocks) return;

        console.log('setting getting blocks to true');
        this.setState({
            gettingBlocks: true,
        });

        try {
            // Gets the latest block number from node
            const newBlockNum = await web3.eth.getBlockNumber();
            if (newBlockNum <= this.state.blockNum) {
                this.setState({
                    gettingBlocks: false,
                });
                return;
            }

            // Fills the cached blocks list. Starts at latest and goes back NUM_BLOCKS_TO_FETCH.
            // Does not fetch if we already have them
            const blocks = this.state.blocks;
            for (
                let n = newBlockNum;
                n > 0 && n > newBlockNum - NUM_BLOCKS_TO_FETCH && n > this.state.blockNum;
                n--) {
                console.log('   fetching', n);
                blocks[n] = await web3.eth.getBlock(n);
            }
            this.setState({
                blockNum: newBlockNum,
                // blocks,
            });
        } catch (error) {
            console.log('Error fetching blocks.', error);
        }
        console.log('setting getting blocks to false');
        this.setState({
            gettingBlocks: false,
        });
    }

    drawBlockchain() {
        console.log('drawing...');
        const svgContainer = d3.select('.svgContainer');
        const blockData = [];
        for (let n = this.state.blockNum; n > 0 && n > this.state.blockNum - NUM_BLOCKS_TO_DISPLAY; n--) {
            blockData.push(this.state.blocks[n]);
        }

        const blocks = svgContainer.selectAll('block')
            .remove()
            .data(blockData)
            .enter()
            .append('rect');

        blocks
            .attr('x', (d, i) => 690 - (i * (BLOCK_WIDTH + 50)))
            .attr('y', 50)
            .attr('height', BLOCK_HEIGHT)
            .attr('width', BLOCK_WIDTH)
            .style('fill', '#f8f8f8')
            .style('rx', 4)
            .style('ry', 4);

        const blockNumsText = svgContainer.selectAll("blockNumsText")
            .remove()
            .data(blockData)
            .enter()
            .append("text");

        blockNumsText
            .attr('x', (block, i) => 700 - i * (BLOCK_WIDTH + 50))
            .attr('y', 40)
            .style('fill', 'white')
            .text((block) => `block ${block.number}`);

        const hashText = svgContainer.selectAll("hashText")
            .remove()
            .data(blockData)
            .enter()
            .append("text");

        hashText
            .attr('x', (block, i) => 700 - i * (BLOCK_WIDTH + 50))
            .attr('y', 70)
            .style('fill', 'black')
            .text((block) => `hash: ${block.hash.substr(0, 10)}..`);

        const prevHashText = svgContainer.selectAll(".prevHashText")
            .remove()
            .data(blockData)
            .enter()
            .append("text");

        prevHashText
            .attr('x', (d, i) => 700 - i * (BLOCK_WIDTH + 50))
            .attr('y', 90)
            .style('fill', 'black')
            .text((block) => `parent hash: ${block.parentHash.substr(0, 10)}..`);

        const rewardText = svgContainer.selectAll("rewardText")
            .remove()
            .data(blockData)
            .enter()
            .append("text");

        rewardText
            .attr('x', (d, i) => 700 - i * (BLOCK_WIDTH + 50))
            .attr('y', 110)
            .style('fill', 'black')
            .text((d) => `reward: ${1} ETH`);

        const gasText = svgContainer.selectAll("gasText")
            .remove()
            .data(blockData)
            .enter()
            .append("text");

        gasText
            .attr('x', (d, i) => 700 - i * (BLOCK_WIDTH + 50))
            .attr('y', 130)
            .style('fill', 'black')
            .text((block) => `gas used: ${block.gasUsed} `);
    }

    render() {
        return (
            <div className="Canvas">
                <svg className="svgContainer" width="1000" height="500">
                </svg>
            </div>
        );
    }
}

export default Canvas;
