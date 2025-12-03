# WhatsApp Agent

Extensão para WhatsApp Web que adiciona automaticamente prefixos de identificação às mensagens enviadas.

## Autores

- **Lucas Moura** - [@lucasmoura333](https://github.com/lucasmoura333)
- **Marcus Vinicius** - [@mvfernandes](https://github.com/mvfernandes)

## Funcionalidades

- **Prefixo Automático**: Adiciona `*Nome - Subtítulo:*` às mensagens
- **Formatação Bold**: Destinatários veem o prefixo em negrito
- **Envio Invisível**: O usuário não vê o prefixo sendo inserido
- **Múltiplos Perfis**: Crie e alterne entre diferentes perfis de agente
- **Ativar/Desativar**: Controle total via popup da extensão

## Instalação

1. Clone ou baixe este repositório
2. Acesse `chrome://extensions/` no Chrome
3. Ative o "Modo do desenvolvedor" (canto superior direito)
4. Clique em "Carregar sem compactação" e selecione a pasta `whatsapp-extension`
5. Abra o WhatsApp Web e clique no ícone da extensão

## Uso

1. Clique no ícone da extensão no WhatsApp Web
2. Crie um novo perfil (ex: "Suporte - Turno Manhã")
3. Ative o perfil
4. Comece a conversar — todas as mensagens serão prefixadas automaticamente!

## Exemplo

**Você digita:**
```
Olá, como posso ajudar?
```

**Destinatário recebe:**
```
*Suporte - Turno Manhã:*
Olá, como posso ajudar?
```

## Tecnologias

- Manifest V3
- Chrome Storage API
- Clipboard API
- MutationObserver

## Licença

MIT License - veja o arquivo LICENSE para detalhes
