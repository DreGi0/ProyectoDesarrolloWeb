const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Cloud Function para cambiar la contraseña de un usuario
 * Solo usuarios con rol "admin" pueden ejecutar esta función
 * 
 * Parámetros esperados:
 * - uid: ID del usuario cuya contraseña se cambiará
 * - newPassword: Nueva contraseña (mínimo 6 caracteres)
 */
exports.cambiarContraseña = functions.https.onCall(async (data, context) => {
    // Verificar que el usuario esté autenticado
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "El usuario debe estar autenticado"
        );
    }

    const uid = data.uid;
    const newPassword = data.newPassword;

    // Validaciones básicas
    if (!uid || typeof uid !== "string") {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "El parámetro 'uid' es requerido y debe ser string"
        );
    }

    if (!newPassword || typeof newPassword !== "string") {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "El parámetro 'newPassword' es requerido y debe ser string"
        );
    }

    if (newPassword.length < 6) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "La contraseña debe tener al menos 6 caracteres"
        );
    }

    try {
        // Verificar que el usuario actual es admin
        const usuarioActual = await admin.auth().getUser(context.auth.uid);
        const docUsuarioActual = await admin
            .firestore()
            .collection("usuarios")
            .doc(context.auth.uid)
            .get();

        if (!docUsuarioActual.exists || docUsuarioActual.data().role !== "admin") {
            throw new functions.https.HttpsError(
                "permission-denied",
                "Solo los administradores pueden cambiar contraseñas de otros usuarios"
            );
        }

        // Cambiar la contraseña
        await admin.auth().updateUser(uid, {
            password: newPassword,
        });

        return {
            success: true,
            message: "Contraseña actualizada correctamente",
        };
    } catch (error) {
        console.error("Error al cambiar contraseña:", error);

        if (error.code === "auth/user-not-found") {
            throw new functions.https.HttpsError(
                "not-found",
                "El usuario no existe"
            );
        }

        throw new functions.https.HttpsError(
            "internal",
            "Error al cambiar contraseña: " + error.message
        );
    }
});
