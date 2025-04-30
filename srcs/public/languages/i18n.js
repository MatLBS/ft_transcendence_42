import i18next from 'i18next';

i18next
  .init({
	resources: {
	  en: {
	  	translation: {
	  	  "about": {
			"title": "Discover the team",
			"welcome": "We are",
			"more": "Scroll down to learn more about us",
			"titleMiguel": "Full-Stack Developer",
			"presentationMiguel": "Full-Stack Developer",
			"titleJb": "Full-Stack Developer",
			"presentationJb": "Full-Stack Developer",
			"titleMateo": "Full-Stack Developer",
			"presentationMateo": "Full-Stack Developer",
		  },
	  	  "game": {
	  		"local": "Local",
	  		"solo": "Solo",
	  		"tournament": "Tournament"
	  	  },
	  	  "home": {
	  		"title": "🏓 Welcome to Pong 42",
	  		"objectives": "🎯 Games Objectives",
			"objectives_1": "First to 5 points wins.",
			"objectives_2": "Ball speed increases over time.",
			"objectives_3": "Angle depends on where you hit the ball.",
			"objectives_4": "No power-ups—pure Pong skill!",
			"controles":"🕹️ Controles",
			"controles_1":"Left Player W ➡️ Up | S ➡️ Down ",
			"controles_2":"Right Player (IA or Friend) Arrow Up ➡️ Up | Arrow Down ➡️ Down",
			"modes":"🏆 Game modes",
			"modes_1": "Local against one friend",
			"modes_2": "Solo against our machavielic IA",
			"modes_3": "Tournament up to 16 persons !",
			"play":"Play Now 🎮",
			"signup":"Sign Up ✨",
	  	  },
	  	  "index": {
	  		"home": "home",
	  		"about": "about",
	  		"game": "game",
	  		"profil": "profil",
	  		"logout": "logout",
	  		"login": "Login",
			"flag": "🇬🇧",
	  	  },
	  	  "localParty": {
	  		"label": "Enter a name for the second player...",
	  		"button": "Validate",
			"username": "enter a name",
	  	  },
	  	  "login": {
	  		"title": "Login",
	  		"username": "Username",
	  		"password": "Password",
	  		"button": "Login",
	  		"register_p": "Don't have an account ?",
	  		"register_a": "Register",
			"usernameRequired": "Username is required",
			"passwordRequired": "Password is required",
	  	  },
	  	  "profil": {
	  		"statistics": "Statistics",
	  		"matchHistory": "Match History",
	  		"type": "Type",
	  		"winner": "Winner",
	  		"loser": "Loser",
	  		"score": "Score",
	  		"graphics": "Graphics",
	  		"global": "Global Statistics",
	  		"local": "Local Statistics",
	  		"solo": "Solo Statistics",
	  		"tournament": "Tournament Statistics",
	  		"update": "Update",
			"friends": "Friends",
			"listFriends": "List of friends",
			"deleteFriends": "Remove"
	  	  },
	  	  "register": {
	  		"title": "Register",
	  		"username": "Username",
	  		"email": "Email",
	  		"password": "Password",
	  		"button": "Confirm"
	  	  },
		  "solo": {
	  		"sentence": "You will be playing on the left side, the IA on the right ! Are you ready ?",
			"button": "Ready !",
		},
	  	  "tournament": {
	  		"nbPlayers": "How many players will participate in the tournament ?",
			"player": "Player",
			"nextMatch": "Next match",
			"validate": "Validate",
			"enter": "enter a name",
	  	  },
	  	  "update": {
	  		"title": "Update",
	  		"username": "Username",
	  		"email": "Email",
	  		"prevPassword": "Previous Password",
	  		"newPassword": "New Password",
	  		"button": "Confirm"
	  	  },
		  "verify": {
			"regexEmail": "Email is required.",
			"username": "Username is required.",
			"minimumLengthUser": "Username must be between 3 and 20 characters long.",
			"invalidEmail": "The email is not valid.",
			"password": "Password is required.",
			"regexPassword": "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.",
			"invalidFormat": "Invalid file type. Only images are allowed.",
			"usernameAlreadyExists": "This username already exists.",
			"emailAlreadyExists": "This email already exists.",
			"prevPassword": "The previous password is required.",
			"wrongPrevPassword": "The previous password is incorrect.",
			"diffPassword": "The new password must be different from the previous one.",

		  }
	  	}
	    },
	    es: {
	  	translation: {
	  	  "about": {
			"title": "Descubre el equipo",
			"welcome": "Somos",
			"more": "Desplázate para saber más sobre nosotros",
			"titleMiguel": "Desarrollador Full-Stack",
			"presentationMiguel": "Desarrollador Full-Stack",
			"titleJb": "Desarrollador Full-Stack",
			"presentationJb": "Desarrollador Full-Stack",
			"titleMateo": "Desarrollador Full-Stack",
			"presentationMateo": "Desarrollador Full-Stack",
		  },
	  	  "game": {
	  		"local": "Local",
			"solo": "Solo",
	  		"tournament": "Torneo"
	  	  },
	  	  "home": {
			"title": "🏓 Bienvenido a Pong 42",
			"objectives": "🎯 Objetivos del juego",
			"objectives_1": "El primero en llegar a 5 puntos gana.",
			"objectives_2": "La velocidad de la pelota aumenta con el tiempo.",
			"objectives_3": "El ángulo depende de dónde golpees la pelota.",
			"objectives_4": "Sin power-ups—¡pura habilidad en el Pong!",
			"controles": "🕹️ Controles",
			"controles_1": "Jugador izquierdo: W ➡️ Arriba | S ➡️ Abajo",
			"controles_2": "Jugador derecho (IA o amigo): Flecha arriba ➡️ Arriba | Flecha abajo ➡️ Abajo",
			"modes": "🏆 Modos de juego",
			"modes_1": "Local contra un amigo",
			"modes_2": "Solo contra nuestra IA maquiavélica",
			"modes_3": "¡Torneo de hasta 16 personas!",
			"play": "Jugar ahora 🎮",
			"signup": "Registrarse ✨"
	  	  },
	  	  "index": {
	  		"home": "inicio",
	  		"about": "acerca de",
	  		"game": "juego",
	  		"profil": "perfil",
	  		"logout": "cerrar sesión",
	  		"login": "Iniciar sesión",
			"flag": "🇪🇸",
	  	  },
	  	  "localParty": {
			"label": "Introduce un nombre para el segundo jugador...",
			"button": "Validar",
			"username": "introduce un nombre"
		  },
	  	  "login": {
	  		"title": "Iniciar sesión",
	  		"username": "Nombre de usuario",
	  		"password": "Contraseña",
	  		"button": "Iniciar sesión",
	  		"register_p": "¿No tienes una cuenta?",
	  		"register_a": "Registrarse",
			"usernameRequired": "Nombre de usuario es obligatorio",
        	"passwordRequired": "Contraseña es obligatoria"
	  	  },
	  	  "profil": {
            "statistics": "Estadísticas",
            "matchHistory": "Historial de partidas",
            "type": "Tipo",
            "winner": "Ganador",
            "loser": "Perdedor",
            "score": "Puntuación",
            "graphics": "Gráficos",
            "global": "Estadísticas Globales",
            "local": "Estadísticas Locales",
            "solo": "Estadísticas Solo",
            "tournament": "Estadísticas de Torneo",
            "update": "Actualizar",
			"friends": "Amigos",
			"listFriends": "Lista de amigos",
			"deleteFriends": "Eliminar"
          },
	  	  "register": {
	  		"title": "Registro",
	  		"username": "Nombre de usuario",
	  		"email": "Correo electrónico",
	  		"password": "Contraseña",
	  		"button": "Confirmar"
	  	  },
		  "solo": {
			"sentence": "Jugarás en el lado izquierdo, la IA en el derecho. ¿Estás listo?",
			"button": "¡Listo!"
		  },
	  	  "tournament": {
			"nbPlayers": "¿Cuántos jugadores participarán en el torneo?",
			"player": "Jugador",
			"nextMatch": "Próximo partido",
			"validate": "Validar",
			"enter": "introduce un nombre"
		  },
	  	  "update": {
	  		"title": "Actualizar",
	  		"username": "Nombre de usuario",
	  		"email": "Correo electrónico",
	  		"prevPassword": "Contraseña anterior",
	  		"newPassword": "Nueva contraseña",
	  		"button": "Confirmar"
	  	  },
		  "verify": {
			"regexEmail": "El correo electrónico es obligatorio.",
			"username": "El nombre de usuario es obligatorio.",
			"minimumLengthUser": "El nombre de usuario debe tener entre 3 y 20 caracteres.",
			"invalidEmail": "El correo electrónico no es válido.",
			"password": "La contraseña es obligatoria.",
			"regexPassword": "La contraseña debe tener al menos 8 caracteres e incluir al menos una letra mayúscula, una letra minúscula y un carácter especial.",
			"invalidFormat": "Tipo de archivo no válido. Solo se permiten imágenes.",
			"usernameAlreadyExists": "Este nombre de usuario ya existe.",
			"emailAlreadyExists": "Este correo electrónico ya existe.",
			"prevPassword": "Se requiere la contraseña anterior.",
			"wrongPrevPassword": "La contraseña anterior es incorrecta.",
			"diffPassword": "La nueva contraseña debe ser diferente de la anterior."
		  }
	  	}
	    },
	    pt: {
	  	translation: {
	  	  "about": {
			"title": "Conheça a equipe",
			"welcome": "Somos",
			"more": "Role para saber mais sobre nós",
			"titleMiguel": "Desenvolvedor Full-Stack",
			"presentationMiguel": "Desenvolvedor Full-Stack",
			"titleJb": "Desenvolvedor Full-Stack",
			"presentationJb": "Desenvolvedor Full-Stack",
			"titleMateo": "Desenvolvedor Full-Stack",
			"presentationMateo": "Desenvolvedor Full-Stack",
		  },
	  	  "game": {
	  		"local": "Local",
			"solo": "Solo",
	  		"tournament": "Torneio"
	  	  },
	  	  "home": {
			"title": "🏓 Bem-vindo ao Pong 42",
			"objectives": "🎯 Objetivos do jogo",
			"objectives_1": "O primeiro a alcançar 5 pontos vence.",
			"objectives_2": "A velocidade da bola aumenta com o tempo.",
			"objectives_3": "O ângulo depende de onde você acerta a bola.",
			"objectives_4": "Sem power-ups—pura habilidade no Pong!",
			"controles": "🕹️ Controles",
			"controles_1": "Jogador esquerdo: W ➡️ Cima | S ➡️ Baixo",
			"controles_2": "Jogador direito (IA ou amigo): Seta para cima ➡️ Cima | Seta para baixo ➡️ Baixo",
			"modes": "🏆 Modos de jogo",
			"modes_1": "Local contra um amigo",
			"modes_2": "Solo contra nossa IA maquiavélica",
			"modes_3": "Torneio com até 16 pessoas!",
			"play": "Jogar agora 🎮",
			"signup": "Inscrever-se ✨"
	  	  },
	  	  "index": {
	  		"home": "início",
	  		"about": "sobre",
	  		"game": "jogo",
	  		"profil": "perfil",
	  		"logout": "sair",
	  		"login": "Entrar",
			"flag": "🇵🇹",
	  	  },
	  	 "localParty": {
			"label": "Digite um nome para o segundo jogador...",
			"button": "Validar",
			"username": "digite um nome"
		  },
	  	  "login": {
	  		"title": "Entrar",
	  		"username": "Nome de usuário",
	  		"password": "Senha",
	  		"button": "Entrar",
	  		"register_p": "Não tem uma conta?",
	  		"register_a": "Registrar",
			"usernameRequired": "Nome de usuário é obrigatório",
        	"passwordRequired": "Senha é obrigatória"
	  	  },
	  	  "profil": {
            "statistics": "Estatísticas",
            "matchHistory": "Histórico de partidas",
            "type": "Tipo",
            "winner": "Vencedor",
            "loser": "Perdedor",
            "score": "Pontuação",
            "graphics": "Gráficos",
            "global": "Estatísticas Globais",
            "local": "Estatísticas Locais",
            "solo": "Estatísticas Solo",
            "tournament": "Estatísticas de Torneio",
            "update": "Atualizar",
			"friends": "Amigos",
			"listFriends": "Lista de amigos",
			"deleteFriends": "Remover"
          },
	  	  "register": {
	  		"title": "Registro",
	  		"username": "Nome de usuário",
	  		"email": "E-mail",
	  		"password": "Senha",
	  		"button": "Confirmar"
	  	  },
		  "solo": {
			"sentence": "Você jogará no lado esquerdo, a IA no lado direito! Você está pronto?",
			"button": "Pronto!"
		  },
	  	  "tournament": {
			"nbPlayers": "Quantos jogadores participarão do torneio?",
			"player": "Jogador",
			"nextMatch": "Próxima partida",
			"validate": "Validar",
			"enter": "digite um nome"
		  },
	  	  "update": {
	  		"title": "Atualizar",
	  		"username": "Nome de usuário",
	  		"email": "E-mail",
	  		"prevPassword": "Senha anterior",
	  		"newPassword": "Nova senha",
	  		"button": "Confirmar"
	  	  },
		  "verify": {
			"regexEmail": "O e-mail é obrigatório.",
			"username": "O nome de usuário é obrigatório.",
			"minimumLengthUser": "O nome de usuário deve ter entre 3 e 20 caracteres.",
			"invalidEmail": "O e-mail não é válido.",
			"password": "A senha é obrigatória.",
			"regexPassword": "A senha deve ter pelo menos 8 caracteres e conter pelo menos uma letra maiúscula, uma letra minúscula e um caractere especial.",
			"invalidFormat": "Tipo de arquivo inválido. Apenas imagens são permitidas.",
			"usernameAlreadyExists": "Este nome de usuário já existe.",
			"emailAlreadyExists": "Este e-mail já existe.",
			"prevPassword": "A senha anterior é obrigatória.",
			"wrongPrevPassword": "A senha anterior está incorreta.",
			"diffPassword": "A nova senha deve ser diferente da anterior."
		  }
	  	}
	    },
	    fr: {
	  	translation: {
	  	  "about": {
			"title": "Découvrez l'équipe",
			"welcome": "Nous sommes",
			"more": "Faites défiler pour en savoir plus sur nous",
			"titleMiguel": "Développeur Full-Stack",
			"presentationMiguel": "Développeur Full-Stack",
			"titleJb": "Développeur Full-Stack",
			"presentationJb": "Développeur Full-Stack",
			"titleMateo": "Développeur Full-Stack",
			"presentationMateo": "Développeur Full-Stack",
		  },
	  	  "game": {
	  		"local": "Local",
			"solo": "Solo",
	  		"tournament": "Tournoi"
	  	  },
	  	  "home": {
			"title": "🏓 Bienvenue à Pong 42",
			"objectives": "🎯 Objectifs du jeu",
			"objectives_1": "Le premier à 5 points gagne.",
			"objectives_2": "La vitesse de la balle augmente avec le temps.",
			"objectives_3": "L'angle dépend de l'endroit où vous frappez la balle.",
			"objectives_4": "Pas de power-ups—seulement la maîtrise du Pong !",
			"controles": "🕹️ Contrôles",
			"controles_1": "Joueur gauche : W ➡️ Haut | S ➡️ Bas",
			"controles_2": "Joueur droit (IA ou ami) : Flèche haut ➡️ Haut | Flèche bas ➡️ Bas",
			"modes": "🏆 Modes de jeu",
			"modes_1": "Local contre un ami",
			"modes_2": "Solo contre notre IA machiavélique",
			"modes_3": "Tournoi jusqu'à 16 personnes !",
			"play": "Jouer maintenant 🎮",
			"signup": "S'inscrire ✨"
	  	  },
	  	  "index": {
	  		"home": "accueil",
	  		"about": "à propos",
	  		"game": "jeu",
	  		"profil": "profil",
	  		"logout": "déconnexion",
	  		"login": "Connexion",
			"flag": "🇫🇷",
	  	  },
	  	  "localParty": {
	  		"label": "Entrez un nom pour le deuxième joueur...",
	  		"button": "Valider",
			"username": "entrez un nom",
	  	  },
	  	  "login": {
	  		"title": "Connexion",
	  		"username": "Nom d'utilisateur",
	  		"password": "Mot de passe",
	  		"button": "Se connecter",
	  		"register_p": "Vous n'avez pas de compte ?",
	  		"register_a": "S'inscrire",
			"usernameRequired": "Le nom d'utilisateur est requis",
			"passwordRequired": "Le mot de passe est requis"
	  	  },
	  	  "profil": {
            "statistics": "Statistiques",
            "matchHistory": "Historique des matchs",
            "type": "Type",
            "winner": "Gagnant",
            "loser": "Perdant",
            "score": "Score",
            "graphics": "Graphiques",
            "global": "Statistiques Globales",
            "local": "Statistiques Locales",
            "solo": "Statistiques Solo",
            "tournament": "Statistiques de Tournoi",
            "update": "Mettre à jour",
			"friends": "Amis",
			"listFriends": "Liste d'amis",
			"deleteFriends": "Supprimer"
          },
	  	  "register": {
	  		"title": "Inscription",
	  		"username": "Nom d'utilisateur",
	  		"email": "Email",
	  		"password": "Mot de passe",
	  		"button": "Confirmer"
	  	  },
		  "solo": {
			"sentence": "Vous jouerez du côté gauche, l'IA du côté droit ! Êtes-vous prêt ?",
			"button": "Prêt !"
		  },
	  	  "tournament": {
			"nbPlayers": "Combien de joueurs participeront au tournoi ?",
			"player": "Joueur",
			"nextMatch": "Prochain match",
			"validate": "Valider",
			"enter": "entrez un nom",
		  },
	  	  "update": {
	  		"title": "Mettre à jour",
	  		"username": "Nom d'utilisateur",
	  		"email": "Email",
	  		"prevPassword": "Mot de passe précédent",
	  		"newPassword": "Nouveau mot de passe",
	  		"button": "Confirmer"
	  	  },
		  "verify": {
			"regexEmail": "L'email est requis.",
			"username": "Le nom d'utilisateur est requis.",
			"minimumLengthUser": "Le nom d'utilisateur doit contenir entre 3 et 20 caractères.",
			"invalidEmail": "L'email n'est pas valide.",
			"password": "Le mot de passe est requis.",
			"regexPassword": "Le mot de passe doit contenir au moins 8 caractères, une lettre majuscule, une lettre minuscule et un caractère spécial.",
			"invalidFormat": "Type de fichier invalide. Seules les images sont autorisées.",
			"usernameAlreadyExists": "Ce nom d'utilisateur existe déjà.",
			"emailAlreadyExists": "Cet email existe déjà.",
			"prevPassword": "Le mot de passe précédent est requis.",
			"wrongPrevPassword": "Le mot de passe précédent est incorrect.",
			"diffPassword": "Le nouveau mot de passe doit être différent du précédent."
		  }
	  	}
	    }
	},
	lng: "en", // Langue par défaut
	fallbackLng: "en", // Langue de secours
	interpolation: {
	  escapeValue: false // Non nécessaire pour React car il échappe déjà
	}
  });

export function switchLanguage(lang) {
	i18n.changeLanguage(lang);
}

export default i18next;