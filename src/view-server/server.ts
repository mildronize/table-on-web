import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'node:http';

import type { AllTableData, HeaderComponent, TableComponent } from './types';

import { delay, format } from './utils';

export class DataViewer {
  private dataView: AllTableData[] = [];

  public addData(data: AllTableData) {
    this.dataView.push(data);
  }

  public addTable(data: TableComponent['data']){
    this.dataView.push({type: 'table', data});
  }
  
  public addHeader(data: HeaderComponent['data']){
    this.dataView.push({type: 'header', data});
  }

  public start(){
    startViewServer(this.dataView);
  }
}

export async function startViewServer(dataView: AllTableData[]) {
  const app = express();
  const server = createServer(app);
  const io = new Server(server);
  const port = 3001;

  let isClientConnected = false;

  io.on('connection', socket => {
    console.log('User connected');
    isClientConnected = true;
  });

  // Set the custom path for EJS views
  app.set('views', __dirname + '/views');

  // Set the view engine to EJS
  app.set('view engine', 'ejs');

  // Middleware to add the formatDate function to locals
  app.use((req, res, next) => {
    res.locals.format = format;
    next();
  });

  // Define a route to render the HTML page
  app.get('/', (req, res) => {
    res.render('index', { dataView });
  });

  server.listen(port, async () => {
    console.log(`Server is running at http://localhost:${port}`);
    while (!isClientConnected) {
      await delay(200);
    }
    io.emit('startReload');
  });
}
