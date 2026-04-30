import { io } from "socket.io-client";
 
export const socket = io("http://18.60.40.223:8000", {  
  autoConnect: true,
  withCredentials: true,
});
