require('dotenv').config();
const axios = require('axios');
const { sendMessageFor } = require('simple-telegram-message')

const url = process.env.API_URL;
const IDS_TELEGRAM = process.env.USERS_IDS;
const userIds = IDS_TELEGRAM.split(",");

// Función para hacer el request y procesar la respuesta
async function hacerRequest() {
    try {
        let response = await axios.get(url);
        let datos = response.data;

        // Procesar cada sucursal
        datos.forEach(sucursal => {
            if (sucursal.notificar === 1) {
                let ultimaConexion = sucursal.ultimaconexion;
                calcularColorYDiferencia(ultimaConexion, sucursal);
            }
        });
    } catch (error) {
        console.error('Error al hacer el request:', error);
    }
}

async function calcularColorYDiferencia(ultimaConexion, sucursal) {
    let fechaActual = new Date();
    let fechaConexion = new Date(ultimaConexion);
    let diferenciaEnMilisegundos = fechaActual - fechaConexion;
    let diferenciaEnMinutos = Math.floor(diferenciaEnMilisegundos / 60000);
    let mensaje = `${sucursal.empresa_nombre}\nSucursal: ${sucursal.sucursal_nombre}\nDiferencia en minutos: ${diferenciaEnMinutos}`;
    console.log(mensaje);
    if (diferenciaEnMinutos > 60) {
        try {
            for (const userId of userIds) {
                if (userId) {
                    let sendMessage = sendMessageFor(process.env.TOKEN, userId);
                    await sendMessage(mensaje);
                    console.log("Mensaje enviado...");
                }
            }
        } catch (error) {
            console.error(`Error al enviar el mensaje al usuario`, error.message);
        }
    }
}

async function init() {
    try {
        for (const userId of userIds) {
            if (userId) {
                let sendMessage = sendMessageFor(process.env.TOKEN, userId);
                await sendMessage('El agente está en ejecución y hará un request cada minuto');
            }
        }
    } catch (error) {
        console.error(`Error al enviar el mensaje al usuario`, error.message);
    }


}

init();
setInterval(hacerRequest, 300000);

console.log('El agente está en ejecución y hará un request cada 5 minuto.');
