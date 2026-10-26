-- Ambientes e equipamentos iniciais da sede (cadastros; novos recursos entram como registros, sem mudar código).
-- O usuário administrador inicial é criado na subida da aplicação (ver DadosIniciais), pois a senha precisa de hash BCrypt.

INSERT INTO recurso (nome, tipo, localizacao, descricao, capacidade, exige_aprovacao,
                     horario_abertura, horario_fechamento, recursos_disponiveis)
VALUES
    ('Espaço Coworking Compartilhado', 'COWORKING', 'Térreo • Ala Sul Sede Mútua-PI',
     'Estações de trabalho individuais para profissionais associados.', 24, FALSE,
     '08:00', '18:00', ARRAY['Wi-Fi 6', 'Climatização', 'Café', 'Tomadas individuais']),
    ('Sala de Reuniões Executiva A', 'SALA', '2º Andar • Sala 204',
     'Ambiente acústico com videoconferência e TV 65" 4K.', 8, FALSE,
     '08:00', '18:00', ARRAY['Smart TV 65" 4K', 'Videoconferência', 'Quadro branco', 'Climatização']),
    ('Auditório Master Cláudio Portella', 'AUDITORIO', '3º Andar • Sede Mútua-PI',
     'Auditório para eventos, seminários e treinamentos.', 60, TRUE,
     '08:00', '21:00', ARRAY['Projetor Laser 6000L', 'Som Digital', 'Microfones', 'Púlpito']);

INSERT INTO recurso (nome, tipo, patrimonio, localizacao, descricao, categoria, capacidade, prazo_max_dias,
                     exige_aprovacao, exige_art_sisant, horario_abertura, horario_fechamento, especificacoes)
VALUES
    ('Drone DJI Phantom 4 RTK', 'EQUIPAMENTO', 'HUB-0042', 'Balcão Sede Teresina',
     'Aeronave para mapeamento aéreo centimétrico com estação D-RTK 2.', 'Topografia / VANT', 1, 3,
     TRUE, TRUE, '08:00', '18:00', ARRAY['Câmera 20MP', 'Obturador Mecânico', '3 Baterias']),
    ('Estação Total Leica FlexLine TS07', 'EQUIPAMENTO', 'HUB-0008', 'Balcão Sede Teresina',
     'Estação total manual de alta precisão angular de 2 segundos.', 'Geodésia / Agrimensura', 1, 5,
     TRUE, TRUE, '08:00', '18:00', ARRAY['Precisão 2"', 'Alcance 500m sem prisma', 'Tripé incluso']),
    ('Câmera Termográfica FLIR E8-XT', 'EQUIPAMENTO', 'HUB-0019', 'Balcão Sede Teresina',
     'Diagnóstico infravermelho predial e elétrico.', 'Termografia', 1, 3,
     TRUE, FALSE, '08:00', '18:00', ARRAY['Resolução 320x240', 'Bateria extra', 'Maleta']);
