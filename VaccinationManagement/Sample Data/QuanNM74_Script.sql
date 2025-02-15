Use VaccinationManagement;

-- disable referential integrity
EXEC sp_MSForEachTable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL' 


-- delete all tables data
EXEC sp_MSForEachTable 'DELETE FROM ?' 


-- enable referential integrity again 
EXEC sp_MSForEachTable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL' 


INSERT INTO Menus (Id, Name, Path, Icon, ParentID, [Status])
VALUES 
('M0001', 'Dashboard', '/', 'Home', null, 1),
('M0002', 'Vaccination schedule', null, 'Calendar', null, 1),
('M0003', 'Schedule list', '/schedule', 'List', 'M0002', 1),
('M0004', 'Schedule create', '/schedule/create', 'PlusSquare', 'M0002', 1),
('M0005', 'Vaccine type', null, 'Package', null, 1),
('M0006', 'Vaccine type list', '/vaccineType', 'List', 'M0005', 1),
('M0007', 'Vaccine type create', '/addVaccineType', 'PlusSquare', 'M0005', 1),
('M0008', 'Vaccine', null, 'ClipboardList', null, 1),
('M0009', 'Vaccine list', '/vaccine', 'List', 'M0008', 1),
('M0010', 'Vaccine create', '/vaccine/add', 'PlusSquare', 'M0008', 1),
('M0011', 'Distribute Vaccine', '/vaccine/distribute', 'Send', 'M0008', 1),
('M0012', 'Vaccination result', null, 'Edit', null, 1),
('M0013', 'Vaccination result list', '/vaccinationResult', 'List', 'M0012', 1),
('M0014', 'Vaccination result create', '/vaccinationResult/create', 'PlusSquare', 'M0012', 1),
('M0015', 'Employee', null, 'Users', null, 1),
('M0016', 'Employee list', '/employee', 'List', 'M0015', 1),
('M0017', 'Employee create', '/new-employee', 'PlusSquare', 'M0015', 1),
('M0018', 'News', null, 'Newspaper', null, 1),
('M0019', 'News list', '/news', 'List', 'M0018', 1),
('M0020', 'News create', '/news/create', 'PlusSquare', 'M0018', 1),
('M0021', 'Report', null, 'BarChart', null, 1),
('M0022', 'Injections Report', '/report', 'FileText', 'M0021', 1),
('M0023', 'Customers Report', '/report/customerReport', 'Users', 'M0021', 1),
('M0024', 'Vaccines Report', '/report/vaccineReport', 'Package', 'M0021', 1),
('M0025', 'Customer', null, 'User', null, 1),
('M0026', 'Customer list', '/customer', 'List', 'M0025', 1),
('M0027', 'Customer create', '/customer/create', 'PlusSquare', 'M0025', 1),
('M0028', 'Menu', '/menu', 'Menu', null, 1);

SELECT * FROM Menus

-- Reset auto identity count
DBCC CHECKIDENT (Roles, RESEED, 0)

-- Sample data for Roles
INSERT INTO Roles(Role_Name)
VALUES
('Customer'),
('Employee'),
('Admin')

SELECT * FROM Roles

-- Sample data for MenuRoleAuthorizations
INSERT INTO MenuRoleAuthorizations(MenuId, RoleId)
VALUES
('M0028', '3'),
('M0001', '2'),
('M0001', '3'),

('M0002', '3'),
('M0003', '3'),
('M0004', '3'),
('M0005', '3'),
('M0006', '3'),
('M0007', '3'),
('M0008', '3'),
('M0009', '3'),
('M0010', '3'),
('M0011', '3'),
('M0012', '3'),
('M0013', '3'),
('M0014', '3'),
('M0015', '3'),
('M0016', '3'),
('M0017', '3'),
('M0018', '3'),
('M0019', '3'),
('M0020', '3'),
('M0021', '3'),
('M0022', '3'),
('M0023', '3'),
('M0024', '3'),
('M0025', '3'),
('M0026', '3'),
('M0027', '3'),

('M0002', '2'),
('M0003', '2'),
('M0005', '2'),
('M0006', '2'),
('M0008', '2'),
('M0009', '2'),
('M0012', '2'),
('M0013', '2'),
('M0015', '2'),
('M0016', '2'),
('M0018', '2'),
('M0019', '2'),
('M0021', '2'),
('M0025', '2'),
('M0026', '2');

SELECT * FROM MenuRoleAuthorizations


-- Sample data for EmployeesPositions
INSERT INTO EmployeePositions(Id, Position_Name, [Status])
VALUES
('PO000001', 'Doctor', 1),
('PO000002', 'Nurse', 1),
('PO000003', 'Nursing', 1),
('PO000004', 'Babysitter', 0)

SELECT * from EmployeePositions
-- Insertions for the Place table
INSERT INTO Places (Id, Name, Status, Address)
VALUES 
('PL000001', N'City Clinic', 1, N'Số 1 Nguyễn Trãi, Quận 1, TP.HCM'),
('PL000002', N'Downtown Health Center', 1, N'Số 12 Lý Tự Trọng, Quận Hoàn Kiếm, Hà Nội'),
('PL000003', N'University Health Service', 1, N'Số 5 Đại Cồ Việt, Quận Hai Bà Trưng, Hà Nội'),
('PL000004', N'Central Park Clinic', 1, N'Số 3 Lê Duẩn, Quận 1, TP.HCM'),
('PL000005', N'Eastside Hospital', 1, N'Số 10 Lê Lợi, TP. Huế, Thừa Thiên Huế'),
('PL000006', N'West End Clinic', 1, N'Số 8 Phạm Ngũ Lão, TP. Đà Nẵng'),
('PL000007', N'Airport Health Center', 1, N'Số 7 Trường Sơn, Quận Tân Bình, TP.HCM'),
('PL000008', N'Southside School', 1, N'Số 15 Nguyễn Văn Linh, Quận 7, TP.HCM'),
('PL000009', N'Tech Park Medical Center', 1, N'Số 22 Võ Văn Kiệt, TP. Thủ Đức, TP.HCM'),
('PL000010', N'Community Health Hub', 1, N'Số 6 Tôn Đức Thắng, TP. Nha Trang, Khánh Hòa');

SELECT * FROM Places


-- Insertions for the Vaccine_Type table
INSERT INTO Vaccine_Types (Id, Description, Vaccine_Type_Name, Status)
VALUES 
('VT000001', 'Vaccine for seasonal flu, effective against 2 strains of flu A and 2 strains of flu B.', 'GCFlu Quadrivalent (South Korea)', 1),
('VT000002', 'Pneumococcal vaccine that prevents diseases caused by Streptococcus pneumoniae, such as pneumonia, meningitis, and sepsis.', 'Pneumovax 23 (USA)', 1),
('VT000003', 'A vaccine designed to prevent pneumonia caused by Streptococcus pneumoniae, available in various formulations like PCV13 and PCV10.', 'Pneumococcal Vaccine (Various)', 1),
('VT000004', 'Inactivated influenza vaccine that targets seasonal flu strains for adults and children.', 'Influvac Tetra (Netherlands)', 1),
('VT000005', 'Influenza vaccine designed for the prevention of seasonal flu, particularly for children and adults.', 'Vaxigrip Tetra (France)', 1),
('VT000006', 'Vaccine for prevention of the flu, containing 2 strains of type A flu and 2 strains of type B flu.', 'Ivacflu-S (Vietnam)', 1),
('VT000007', 'A vaccine used for preventing influenza caused by seasonal flu viruses.', 'Flu Quad Vaccine (General)', 1),
('VT000008', 'Vaccine targeting human papillomavirus (HPV) to prevent infections that can lead to cervical and other cancers.', 'HPV Vaccine (Various)', 1),
('VT000009', 'Vaccine for the prevention of whooping cough, tetanus, and diphtheria.', 'DTP Vaccine (Various)', 1),
('VT000010', 'Combination vaccine against various infectious diseases like polio, hepatitis, and diphtheria.', 'Combination Vaccines (Various)', 1);

select * from Vaccine_Types

-- Sample Insertions for the Vaccine table
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000001', N'Không', N'Người lớn và trẻ em trên 12 tuổi', 20, N'Mỹ', CAST(N'2024-01-01' AS Date), CAST(N'2026-01-15' AS Date), N'Tiêm bắp', N'Pfizer-BioNTech', 130000, 200000, N'/Uploads/Vaccine/6a9f8300-d85a-432f-8227-eaac2e8de073.png', N'Vắc-xin Pfizer-BioNTech COVID-19 được chỉ định cho trẻ em từ 5 đến 11 tuổi (dạng lọ đơn liều 10mcg / 0.3mL) và trẻ từ 6 tháng đến 4 tuổi (dạng lọ nhiều liều 3mcg / 0.3mL, mỗi lọ 3 liều).', 3, 45, 1, N'VT000001')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000002', N'Dị ứng với trứng gà', N'Trẻ em từ 6-12 tháng tuổi', 1, N'Pháp', CAST(N'2024-02-10' AS Date), CAST(N'2026-02-20' AS Date), N'Vắc-xin uống', N'Sanofi-Pasteur', 140000, 200000, N'/Uploads/Vaccine/bd1faa4f-9dd8-4181-833c-e60073682cdb.png', N'Vắc-xin uống Sanofi-Pasteur cung cấp khả năng bảo vệ chống bại liệt.', 2, 30, 1, N'VT000002')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000003', N'Phụ nữ mang thai', N'Người lớn trên 60 tuổi', 3, N'Đức', CAST(N'2024-03-05' AS Date), CAST(N'2025-03-20' AS Date), N'Tiêm dưới da', N'Moderna', 130000, 215000, N'/Uploads/Vaccine/7ebf4c68-49fc-4104-bdf8-e52bc4b07a1f.png', N'Moderna là vắc-xin COVID-19 hiệu quả cao cho người cao tuổi.', 4, 60, 1, N'VT000003')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000004', N'Không', N'Người lớn từ 18-45 tuổi', 2, N'Anh', CAST(N'2024-04-10' AS Date), CAST(N'2025-04-25' AS Date), N'Tiêm bắp', N'AstraZeneca', 150000, 200000, N'/Uploads/Vaccine/5c3021e3-4e0b-4405-8251-dfa61baefbc0.png', N'Vắc-xin AstraZeneca hiệu quả với nhiều biến thể COVID-19.', 2, 40, 1, N'VT000004')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000005', N'Suy giảm miễn dịch', N'Trẻ em từ 2-6 tuổi', 1, N'Trung Quốc', CAST(N'2024-05-15' AS Date), CAST(N'2027-05-30' AS Date), N'Tiêm bắp', N'Sinovac', 130000, 225000, N'/Uploads/Vaccine/d257fb74-2d7b-41ea-8f82-74b3a17942a8.png', N'Sinovac là vắc-xin bất hoạt dành cho trẻ nhỏ, mang lại khả năng miễn dịch rộng.', 1, 25, 1, N'VT000005')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000006', N'Hen suyễn nặng', N'Người lớn từ 20-40 tuổi', 2, N'Ấn Độ', CAST(N'2024-06-01' AS Date), CAST(N'2025-06-15' AS Date), N'Tiêm bắp', N'Covaxin', 120000, 190000, N'/Uploads/Vaccine/1c575c1c-0479-4bb7-8681-c72b586584d5.png', N'Covaxin hiệu quả trong việc bảo vệ chống COVID-19 cho người lớn.', 3, 50, 1, N'VT000001')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000007', N'Không', N'Phụ nữ mang thai', 2, N'Mỹ', CAST(N'2024-07-10' AS Date), CAST(N'2025-07-25' AS Date), N'Tiêm bắp', N'Johnson & Johnson', 135000, 210000, N'/Uploads/Vaccine/29c4693c-62d1-417b-81e8-addb27388ca7.png', N'Vắc-xin Johnson & Johnson mang lại khả năng bảo vệ chỉ với một liều.', 4, 70, 1, N'VT000002')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000008', N'Dị ứng với trứng', N'Trẻ em từ 1-5 tuổi', 1, N'Anh', CAST(N'2025-08-05' AS Date), CAST(N'2026-08-20' AS Date), N'Vắc-xin uống', N'Infanrix', 110000, 170000, N'/Uploads/Vaccine/c73de0df-9128-42ac-bc5c-0191b23a87a1.png', N'Infanrix bảo vệ chống lại bạch hầu, uốn ván và ho gà.', 2, 35, 1, N'VT000003')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000009', N'Không', N'Nhân viên y tế', 2, N'Đức', CAST(N'2024-09-01' AS Date), CAST(N'2025-09-15' AS Date), N'Tiêm bắp', N'Comirnaty', 140000, 220000, N'/Uploads/Vaccine/4156a8b1-3ea2-4c52-b85a-1f9a658ed76c.png', N'Comirnaty là vắc-xin COVID-19 đáng tin cậy dành cho nhân viên tuyến đầu.', 5, 90, 1, N'VT000004')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000010', N'Không', N'Khách du lịch đến các vùng dịch bệnh lưu hành', 1, N'Ấn Độ', CAST(N'2024-10-15' AS Date), CAST(N'2027-10-30' AS Date), N'Vắc-xin uống', N'Vaxchora', 125000, 185000, N'/Uploads/Vaccine/75ef4550-1720-4622-807d-65de82d2ac56.png', N'Vaxchora bảo vệ chống lại bệnh tả cho khách du lịch.', 3, 60, 1, N'VT000005')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000011', N'Không', N'Trẻ sơ sinh dưới 1 tuổi', 1, N'Mỹ', CAST(N'2024-01-01' AS Date), CAST(N'2026-01-15' AS Date), N'Tiêm bắp', N'Pentacel', 140000, 200000, N'/Uploads/Vaccine/08033da4-a4d5-4152-8c34-264ee08b0653.png', N'Pentacel bảo vệ chống bạch hầu, uốn ván, ho gà và bại liệt.', 2, 30, 1, N'VT000001')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000012', N'Không', N'Người lớn trên 50 tuổi', 1, N'Pháp', CAST(N'2024-11-05' AS Date), CAST(N'2024-11-20' AS Date), N'Tiêm dưới da', N'FluQuadri', 100000, 160000, N'/Uploads/Vaccine/5124cf19-546c-4316-be51-6c51a516aeb4.png', N'FluQuadri cung cấp bảo vệ theo mùa chống cúm.', 1, 20, 1, N'VT000002')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000013', N'Không', N'Trẻ em từ 1-3 tuổi', 1, N'Trung Quốc', CAST(N'2024-12-10' AS Date), CAST(N'2024-12-25' AS Date), N'Tiêm bắp', N'Hepavax-Gene', 130000, 200000, N'/Uploads/Vaccine/6f134735-c4d6-4e40-8bab-3874965118b4.png', N'Hepavax-Gene ngăn ngừa nhiễm viêm gan B.', 3, 50, 1, N'VT000003')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000014', N'Không', N'Người lớn từ 18-30 tuổi', 2, N'Đức', CAST(N'2024-08-01' AS Date), CAST(N'2025-08-15' AS Date), N'Tiêm bắp', N'Gardasil', 150000, 250000, N'/Uploads/Vaccine/baa8a287-7366-448a-b875-2b25381a634c.png', N'Gardasil hiệu quả chống lại HPV cho thanh niên.', 5, 90, 1, N'VT000004')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000015', N'Không', N'Trẻ em từ 3-6 tuổi', 1, N'Ấn Độ', CAST(N'2024-10-10' AS Date), CAST(N'2025-10-25' AS Date), N'Vắc-xin uống', N'Rotarix', 115000, 175000, N'/Uploads/Vaccine/cdefdb47-d543-4e15-a313-91a4d5d44648.png', N'Rotarix ngăn ngừa nhiễm rotavirus nghiêm trọng ở trẻ em.', 2, 45, 1, N'VT000005')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000016', N'Không', N'Nhân viên y tế', 2, N'Anh', CAST(N'2024-09-01' AS Date), CAST(N'2025-09-15' AS Date), N'Tiêm bắp', N'Shingrix', 145000, 215000, N'/Uploads/Vaccine/f594c121-3789-4a8a-8d9c-0a8114724605.png', N'Shingrix được khuyến nghị để phòng ngừa bệnh zona.', 3, 60, 1, N'VT000001')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000017', N'Dị ứng nặng', N'Trẻ em từ 6-12 tháng tuổi', 1, N'Pháp', CAST(N'2025-02-10' AS Date), CAST(N'2026-02-20' AS Date), N'Vắc-xin uống', N'Boostrix', 140000, 200000, N'/Uploads/Vaccine/50e5be1b-e5b7-495c-8da5-389b0bd7f845.png', N'Boostrix cung cấp khả năng bảo vệ chống ho gà.', 4, 70, 1, N'VT000002')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000018', N'Không', N'Phụ nữ mang thai trong tam cá nguyệt thứ 2', 2, N'Đức', CAST(N'2024-05-01' AS Date), CAST(N'2025-05-15' AS Date), N'Tiêm bắp', N'Tdap', 130000, 190000, N'/Uploads/Vaccine/45a09156-692c-4dc2-b276-e817a91df634.png', N'Vắc-xin Tdap an toàn và được khuyến nghị cho phụ nữ mang thai.', 5, 80, 1, N'VT000003')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000019', N'Không', N'Trẻ sơ sinh và trẻ em', 2, N'Trung Quốc', CAST(N'2024-11-10' AS Date), CAST(N'2025-11-25' AS Date), N'Tiêm bắp', N'BCG', 110000, 150000, N'/Uploads/Vaccine/8f1efcbd-767f-499e-ad6e-b8810769a3a0.png', N'Vắc-xin BCG bảo vệ chống lao.', 3, 55, 1, N'VT000004')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000020', N'Không', N'Khách du lịch đến các vùng nhiệt đới', 1, N'Mỹ', CAST(N'2024-03-01' AS Date), CAST(N'2027-03-15' AS Date), N'Tiêm bắp', N'YF-Vax', 140000, 200000, N'/Uploads/Vaccine/ca31281a-f817-4f15-890b-6c60fcc053ba.png', N'YF-Vax cung cấp miễn dịch chống sốt vàng da cho khách du lịch.', 4, 70, 1, N'VT000005')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000021', N'Không', N'Trẻ em từ 6 tháng tuổi trở lên', 1, N'Việt Nam', CAST(N'2024-01-01' AS Date), CAST(N'2025-01-01' AS Date), N'Tiêm bắp', N'Ivacflu-S', 90000, 120000, N'/Uploads/Vaccine/3e8cdf7d-dae7-44d4-8d91-030be6e0f7b7.png', N'Ivacflu-S là vắc-xin phòng cúm chứa 2 chủng cúm A và 2 chủng cúm B.', 1, 12, 1, N'VT000006')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000022', N'Không', N'Trẻ em từ 6 tháng tuổi trở lên', 1, N'Tổng hợp', CAST(N'2024-02-01' AS Date), CAST(N'2025-02-01' AS Date), N'Tiêm bắp', N'Flu Quad Vaccine', 100000, 140000, N'/Uploads/Vaccine/d378079e-e449-458f-9b1b-fbaecd1935f8.png', N'Flu Quad Vaccine là vắc-xin phòng cúm hiệu quả cho cả trẻ em và người lớn.', 1, 12, 1, N'VT000007')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000023', N'Không', N'Phụ nữ trong độ tuổi 18-45', 3, N'Tổng hợp', CAST(N'2024-03-01' AS Date), CAST(N'2025-03-01' AS Date), N'Tiêm bắp', N'HPV Vaccine', 120000, 160000, N'/Uploads/Vaccine/d47182cf-13d8-4856-9520-14821a2c3a6e.png', N'HPV Vaccine giúp phòng ngừa các bệnh liên quan đến vi rút HPV, bao gồm ung thư cổ tử cung.', 3, 60, 1, N'VT000008')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000024', N'Không', N'Trẻ em dưới 12 tháng tuổi', 3, N'Tổng hợp', CAST(N'2024-04-01' AS Date), CAST(N'2025-04-01' AS Date), N'Tiêm bắp', N'DTP Vaccine', 110000, 150000, N'/Uploads/Vaccine/e5422bc3-6a24-4688-9939-55e4796e56c9.png', N'DTP Vaccine giúp bảo vệ trẻ em khỏi ho gà, uốn ván và bạch hầu.', 3, 45, 1, N'VT000009')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000025', N'Không', N'Trẻ em từ 2 tháng tuổi trở lên', 5, N'Tổng hợp', CAST(N'2024-05-01' AS Date), CAST(N'2025-05-01' AS Date), N'Tiêm bắp', N'Combination Vaccine', 140000, 180000, N'/Uploads/Vaccine/24a56ad0-fef6-488e-aa73-fb1364017010.png', N'Combination Vaccine kết hợp phòng ngừa các bệnh như bại liệt, viêm gan, và bạch hầu.', 5, 60, 1, N'VT000010')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000026', N'Không', N'Người lớn từ 25-50 tuổi', 2, N'Mỹ', CAST(N'2025-01-01' AS Date), CAST(N'2026-06-15' AS Date), N'Tiêm bắp', N'Pfizer Comirnaty 2.0', 150000, 220000, N'/Uploads/Vaccine/f17d42ec-fd4f-43bc-8fc1-1a482ece3b08.png', N'Phiên bản mới của Comirnaty, phù hợp với biến thể mới.', 2, 60, 1, N'VT000001')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000027', N'Dị ứng với latex', N'Trẻ em từ 12-18 tuổi', 3, N'Canada', CAST(N'2025-03-01' AS Date), CAST(N'2026-07-20' AS Date), N'Tiêm bắp', N'Covovax Pediatric', 130000, 190000, N'/Uploads/Vaccine/33e89564-5cc7-4a9b-9a64-65367b495e9d.png', N'Vắc-xin an toàn cho trẻ lớn, ngăn ngừa COVID-19 hiệu quả.', 3, 45, 1, N'VT000001')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000028', N'Dị ứng nặng', N'Người lớn trên 60 tuổi', 1, N'Úc', CAST(N'2025-05-01' AS Date), CAST(N'2026-09-10' AS Date), N'Tiêm bắp', N'Australian Shield', 160000, 250000, N'/Uploads/Vaccine/8e740e35-a041-4ed0-a597-d67766448e0b.png', N'Dòng vắc-xin cao cấp dành riêng cho người cao tuổi.', 1, 30, 1, N'VT000001')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000029', N'Suy giảm miễn dịch', N'Phụ nữ sau sinh', 2, N'Hàn Quốc', CAST(N'2025-07-01' AS Date), CAST(N'2026-12-10' AS Date), N'Tiêm bắp', N'KoreaProtect Plus', 140000, 210000, N'/Uploads/Vaccine/a5840e99-ec33-42a0-9128-71c51e5f417f.png', N'Vắc-xin COVID-19 an toàn cho phụ nữ sau sinh.', 2, 60, 1, N'VT000001')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000030', N'Không', N'Người lớn và trẻ trên 12 tuổi', 1, N'Nhật Bản', CAST(N'2025-09-01' AS Date), CAST(N'2026-12-25' AS Date), N'Tiêm bắp', N'SakuraVax', 135000, 200000, N'/Uploads/Vaccine/db202552-0fb5-4b4c-927a-d1bfa4fd9863.png', N'Vắc-xin công nghệ Nhật Bản với hiệu quả cao.', 1, 40, 1, N'VT000001')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000031', N'Dị ứng với gelatin', N'Trẻ sơ sinh từ 6 tháng tuổi', 2, N'Anh', CAST(N'2025-01-15' AS Date), CAST(N'2026-07-15' AS Date), N'Vắc-xin uống', N'FluGuard', 120000, 180000, N'/Uploads/Vaccine/81a8dd39-aa05-4be5-b5b2-f3e3917d10e2.png', N'FluGuard ngăn ngừa cúm mùa, an toàn cho trẻ nhỏ.', 2, 30, 1, N'VT000002')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000032', N'Không', N'Trẻ sơ sinh từ 1 tháng tuổi', 1, N'Pháp', CAST(N'2025-02-01' AS Date), CAST(N'2026-02-28' AS Date), N'Tiêm bắp', N'InfantShield', 110000, 170000, N'/Uploads/Vaccine/e2ff8251-abb2-43f6-853a-534be8fa9a83.png', N'Bảo vệ sức khỏe trẻ nhỏ trước các bệnh nguy hiểm.', 1, 20, 1, N'VT000002')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000033', N'Không', N'Trẻ em từ 2-4 tuổi', 1, N'Mỹ', CAST(N'2025-03-01' AS Date), CAST(N'2026-03-15' AS Date), N'Vắc-xin uống', N'ChildProtect', 100000, 150000, N'/Uploads/Vaccine/31366980-72ca-42d7-a191-0b223df1abdf.png', N'Phòng ngừa cúm và bệnh đường hô hấp ở trẻ nhỏ.', 1, 15, 1, N'VT000002')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000034', N'Dị ứng protein sữa', N'Trẻ em dưới 6 tuổi', 2, N'Pháp', CAST(N'2025-04-01' AS Date), CAST(N'2026-04-20' AS Date), N'Tiêm dưới da', N'HealthyStart', 140000, 200000, N'/Uploads/Vaccine/eb5896fe-d237-43f0-8f5f-118f9565c4a5.png', N'HealthyStart cho khởi đầu khỏe mạnh của trẻ.', 2, 30, 1, N'VT000002')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000035', N'Không', N'Người lớn trên 50 tuổi', 1, N'Ấn Độ', CAST(N'2025-05-01' AS Date), CAST(N'2026-05-15' AS Date), N'Tiêm bắp', N'SeniorGuard', 125000, 180000, N'/Uploads/Vaccine/1e036b30-46fd-4915-be30-e511e53ccbfc.png', N'Dành riêng cho người lớn tuổi, bảo vệ toàn diện.', 1, 25, 1, N'VT000002')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000036', N'Dị ứng với kháng sinh', N'Trẻ em từ 6-12 tháng tuổi', 1, N'Việt Nam', CAST(N'2024-07-01' AS Date), CAST(N'2025-07-15' AS Date), N'Tiêm bắp', N'Ivacflu-X', 95000, 130000, N'/Uploads/Vaccine/4bac6ca8-9e60-4313-a68a-fe23b8feacce.png', N'Ivacflu-X là vắc-xin phòng cúm có hiệu quả cao ở trẻ nhỏ.', 1, 20, 1, N'VT000006')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000037', N'Không', N'Người lớn trên 50 tuổi', 1, N'Việt Nam', CAST(N'2024-08-01' AS Date), CAST(N'2025-08-20' AS Date), N'Tiêm bắp', N'Ivacshield', 100000, 140000, N'/Uploads/Vaccine/0256d515-c747-4a57-9a37-7ddbcbb0fd4d.png', N'Ivacshield là vắc-xin được khuyến nghị cho người lớn tuổi phòng cúm.', 1, 15, 1, N'VT000006')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000038', N'Hen suyễn', N'Nhân viên y tế', 2, N'Việt Nam', CAST(N'2024-09-10' AS Date), CAST(N'2025-09-25' AS Date), N'Tiêm bắp', N'Fluvivax', 105000, 145000, N'/Uploads/Vaccine/73c4e1cb-ffb6-459c-96fd-fcce36b667b8.png', N'Fluvivax mang lại khả năng bảo vệ cao đối với các chủng cúm mùa.', 2, 30, 1, N'VT000006')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000039', N'Không', N'Trẻ sơ sinh dưới 6 tháng tuổi', 1, N'Việt Nam', CAST(N'2024-10-15' AS Date), CAST(N'2025-10-30' AS Date), N'Tiêm bắp', N'FluLite', 85000, 120000, N'/Uploads/Vaccine/aeb06626-3767-4902-bedb-a3830861c0f3.png', N'FluLite là vắc-xin nhẹ dành cho trẻ sơ sinh với khả năng bảo vệ dịu nhẹ.', 1, 10, 1, N'VT000006')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000040', N'Dị ứng với protein động vật', N'Trẻ em từ 1-3 tuổi', 1, N'Việt Nam', CAST(N'2024-11-20' AS Date), CAST(N'2025-11-25' AS Date), N'Tiêm bắp', N'IvacUltra', 120000, 160000, N'/Uploads/Vaccine/935a41d2-d63f-4a61-9d5c-5d9fdf09c2c8.png', N'IvacUltra là một giải pháp tối ưu cho trẻ em phòng ngừa cúm nặng.', 1, 15, 1, N'VT000006')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000041', N'Dị ứng với gelatin', N'Người trên 60 tuổi', 1, N'Anh', CAST(N'2024-08-01' AS Date), CAST(N'2025-08-10' AS Date), N'Tiêm bắp', N'FluQuad Senior', 105000, 135000, N'/Uploads/Vaccine/befe8dae-f5cd-40e9-8498-e8bbc0aa9fb5.png', N'FluQuad Senior là vắc-xin dành riêng cho người cao tuổi chống lại virus cúm mùa.', 1, 12, 1, N'VT000007')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000042', N'Không', N'Người lớn từ 18 tuổi', 1, N'Mỹ', CAST(N'2024-09-01' AS Date), CAST(N'2025-09-20' AS Date), N'Tiêm bắp', N'FluQuad Adult', 110000, 140000, N'/Uploads/Vaccine/ee067abb-aca6-4c14-8ad0-935f7a835779.png', N'FluQuad Adult hiệu quả trong phòng ngừa cúm mùa.', 1, 15, 1, N'VT000007')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000043', N'Không', N'Người lớn từ 50 tuổi', 1, N'Pháp', CAST(N'2024-10-01' AS Date), CAST(N'2025-10-15' AS Date), N'Tiêm bắp', N'FluQuad Plus', 120000, 150000, N'/Uploads/Vaccine/030a44b2-e02b-49da-b176-c9e4ade09d48.png', N'FluQuad Plus được khuyến cáo cho nhóm người trưởng thành từ 50 tuổi trở lên.', 1, 12, 1, N'VT000007')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000044', N'Không', N'Trẻ em từ 6 tháng', 2, N'Canada', CAST(N'2024-11-01' AS Date), CAST(N'2025-11-15' AS Date), N'Tiêm bắp', N'FluQuad Junior', 95000, 125000, N'/Uploads/Vaccine/2e2f8603-71c1-41e0-b943-ede07a9dbb34.png', N'FluQuad Junior phù hợp với trẻ em từ 6 tháng tuổi.', 2, 12, 1, N'VT000007')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000045', N'Không', N'Phụ nữ mang thai', 1, N'Hàn Quốc', CAST(N'2024-12-01' AS Date), CAST(N'2025-12-20' AS Date), N'Tiêm bắp', N'FluQuad Prenatal', 115000, 145000, N'/Uploads/Vaccine/36964ecb-f840-4cf9-8312-723a10620555.png', N'FluQuad Prenatal dành cho phụ nữ mang thai, bảo vệ cả mẹ và thai nhi.', 1, 12, 1, N'VT000007')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000046', N'Dị ứng với nấm men', N'Phụ nữ từ 9-45 tuổi', 3, N'Mỹ', CAST(N'2024-10-01' AS Date), CAST(N'2026-10-10' AS Date), N'Tiêm bắp', N'Gardasil 9', 1300000, 1500000, N'/Uploads/Vaccine/4e4296dd-2e92-43c4-9e4d-3df260e60e78.png', N'Gardasil 9 giúp ngăn ngừa nhiễm trùng HPV liên quan đến ung thư cổ tử cung.', 3, 60, 1, N'VT000008')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000047', N'Dị ứng với latex', N'Nam giới từ 9-26 tuổi', 2, N'Hà Lan', CAST(N'2024-11-01' AS Date), CAST(N'2025-11-15' AS Date), N'Tiêm bắp', N'Cervarix', 1200000, 1400000, N'/Uploads/Vaccine/70ce66ea-1b67-4013-90e9-445db81bb035.png', N'Cervarix hiệu quả trong việc bảo vệ khỏi virus HPV.', 2, 30, 1, N'VT000008')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000048', N'Dị ứng với protein trứng', N'Người từ 9-45 tuổi', 3, N'Nhật Bản', CAST(N'2024-12-01' AS Date), CAST(N'2026-12-10' AS Date), N'Tiêm bắp', N'HPV Shield', 1350000, 1550000, N'/Uploads/Vaccine/308ea5bc-41ae-4c02-8b03-1f86b33c6f7a.png', N'HPV Shield được thiết kế để bảo vệ chống lại các chủng virus HPV nguy hiểm.', 3, 60, 1, N'VT000008')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000049', N'Dị ứng với latex', N'Phụ nữ từ 10-25 tuổi', 2, N'Hàn Quốc', CAST(N'2025-01-01' AS Date), CAST(N'2025-12-31' AS Date), N'Tiêm bắp', N'HPV Guard', 1250000, 1450000, N'/Uploads/Vaccine/34426b39-75b3-4a6f-8f9d-298bcc46146b.png', N'HPV Guard là một lựa chọn hiệu quả cho bảo vệ khỏi HPV.', 2, 30, 1, N'VT000008')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000050', N'Không', N'Người từ 9 tuổi trở lên', 2, N'Ấn Độ', CAST(N'2024-10-15' AS Date), CAST(N'2025-10-15' AS Date), N'Tiêm bắp', N'HPVac', 1100000, 1350000, N'/Uploads/Vaccine/ebaae5a7-7739-42d6-b726-b64b5c8485bb.png', N'HPVac là vắc-xin giá cả hợp lý và hiệu quả trong bảo vệ khỏi HPV.', 2, 30, 1, N'VT000008')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000051', N'Không', N'Trẻ em dưới 7 tuổi', 3, N'Mỹ', CAST(N'2024-07-01' AS Date), CAST(N'2026-07-10' AS Date), N'Tiêm bắp', N'Daptacel', 50000, 80000, N'/Uploads/Vaccine/99c29c1f-52d8-47fa-a34b-ee5ff785ac33.png', N'Daptacel là vắc-xin DTP với hiệu quả cao phòng ngừa ho gà, uốn ván và bạch hầu.', 3, 60, 1, N'VT000009')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000052', N'Không', N'Trẻ em từ 2 tháng tuổi', 3, N'Pháp', CAST(N'2024-08-01' AS Date), CAST(N'2026-08-15' AS Date), N'Tiêm bắp', N'Infanrix', 55000, 85000, N'/Uploads/Vaccine/b2e93464-37ed-467f-9eb9-2bdb1f7daf5e.png', N'Infanrix được khuyến cáo sử dụng trong chương trình tiêm chủng quốc gia.', 3, 60, 1, N'VT000009')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000053', N'Dị ứng với protein sữa', N'Trẻ em dưới 5 tuổi', 3, N'Canada', CAST(N'2024-09-01' AS Date), CAST(N'2026-09-10' AS Date), N'Tiêm bắp', N'Tripedia', 52000, 82000, N'/Uploads/Vaccine/1b1f9049-e378-48a9-a355-612d3cd24821.png', N'Tripedia là vắc-xin DTP an toàn và hiệu quả.', 3, 60, 1, N'VT000009')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000054', N'Không', N'Trẻ sơ sinh từ 6 tuần tuổi', 3, N'Nhật Bản', CAST(N'2024-10-01' AS Date), CAST(N'2026-10-15' AS Date), N'Tiêm bắp', N'Boostrix', 60000, 90000, N'/Uploads/Vaccine/9ea51d29-af97-4c11-a1cd-c605892e0285.png', N'Boostrix là một phần của lịch tiêm chủng mở rộng.', 3, 60, 1, N'VT000009')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000055', N'Dị ứng với nấm men', N'Trẻ em dưới 1 tuổi', 3, N'Hàn Quốc', CAST(N'2024-11-01' AS Date), CAST(N'2026-11-20' AS Date), N'Tiêm bắp', N'Adacel', 58000, 88000, N'/Uploads/Vaccine/7c654012-2e56-4774-a7fd-ed33c02961d7.png', N'Adacel cung cấp miễn dịch dài hạn chống lại bệnh ho gà, uốn ván và bạch hầu.', 3, 60, 1, N'VT000009')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000056', N'Không', N'Trẻ sơ sinh dưới 1 tuổi', 4, N'Nhật Bản', CAST(N'2024-09-01' AS Date), CAST(N'2026-09-10' AS Date), N'Tiêm bắp', N'Hexaxim', 1100000, 1400000, N'/Uploads/Vaccine/1776100c-965e-4473-a3aa-9c241eac7fbf.png', N'Hexaxim là vắc-xin phối hợp bảo vệ khỏi 6 bệnh truyền nhiễm.', 4, 45, 1, N'VT000010')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000057', N'Không', N'Trẻ em từ 1-5 tuổi', 3, N'Mỹ', CAST(N'2024-10-01' AS Date), CAST(N'2025-10-20' AS Date), N'Tiêm bắp', N'Pentacel', 1000000, 1300000, N'/Uploads/Vaccine/877783c0-191d-4a3a-9fcc-62d305223cb1.png', N'Pentacel bảo vệ khỏi 5 bệnh bao gồm bạch hầu, ho gà, và bại liệt.', 3, 60, 1, N'VT000010')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000058', N'Dị ứng với latex', N'Trẻ từ 6 tuần đến 2 tuổi', 3, N'Hà Lan', CAST(N'2024-11-01' AS Date), CAST(N'2026-11-10' AS Date), N'Tiêm bắp', N'Comvax', 1200000, 1500000, N'/Uploads/Vaccine/602afaf4-b86a-440c-8246-7b92269803c8.png', N'Comvax cung cấp miễn dịch rộng rãi cho trẻ nhỏ.', 3, 45, 1, N'VT000010')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000059', N'Không', N'Trẻ sơ sinh dưới 1 tuổi', 4, N'Ấn Độ', CAST(N'2024-12-01' AS Date), CAST(N'2026-12-10' AS Date), N'Tiêm bắp', N'Polivax', 900000, 1200000, N'/Uploads/Vaccine/cdc5cc0f-3951-4245-8ecd-8ca7f615d064.png', N'Polivax là vắc-xin phổ biến chống lại bại liệt.', 4, 30, 1, N'VT000010')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000060', N'Dị ứng với protein sữa', N'Trẻ em từ 1-6 tuổi', 3, N'Hàn Quốc', CAST(N'2025-01-01' AS Date), CAST(N'2025-12-31' AS Date), N'Tiêm bắp', N'Tetraxim', 950000, 1250000, N'/Uploads/Vaccine/e469f3a4-8543-42cb-8113-136ffd4f16ea.png', N'Tetraxim bảo vệ khỏi 4 bệnh nguy hiểm: bạch hầu, uốn ván, ho gà, và bại liệt.', 3, 45, 1, N'VT000010')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000061', N'Dị ứng với gelatin', N'Trẻ em từ 6 tháng đến 12 tuổi', 1, N'Pháp', CAST(N'2024-11-01' AS Date), CAST(N'2026-04-10' AS Date), N'Tiêm bắp', N'FluMaster Junior', 125000, 195000, N'/Uploads/Vaccine/d5ebfeff-5a36-4d43-bfa8-bac72cf9c833.png', N'FluMaster Junior là vắc-xin phòng ngừa cúm mùa với hiệu quả bảo vệ cao. Được sản xuất bằng công nghệ tiên tiến, vắc-xin này giúp bảo vệ trẻ em khỏi hai chủng cúm A và hai chủng cúm B phổ biến nhất hiện nay. Đặc biệt, FluMaster Junior được thiết kế với hàm lượng kháng nguyên thấp, đảm bảo an toàn cho trẻ nhỏ.', 1, 30, 1, N'VT000001')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000062', N'Dị ứng với protein trứng', N'Người lớn trên 18 tuổi', 1, N'Mỹ', CAST(N'2025-01-01' AS Date), CAST(N'2026-06-30' AS Date), N'Tiêm bắp', N'FluShield Adult', 135000, 205000, N'/Uploads/Vaccine/53941433-2e93-48ed-84a5-67092899b0ba.png', N'FluShield Adult là dòng vắc-xin được phát triển đặc biệt cho người trưởng thành, giúp tăng cường hệ miễn dịch để chống lại virus cúm. Vắc-xin này đã được kiểm nghiệm lâm sàng trên hơn 10,000 người, cho thấy hiệu quả 95% trong việc ngăn ngừa bệnh cúm mùa. FluShield Adult cũng được bổ sung các tá dược tiên tiến, giảm thiểu phản ứng phụ.', 1, 45, 1, N'VT000001')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000063', N'Dị ứng với latex', N'Phụ nữ mang thai ở tam cá nguyệt thứ hai', 1, N'Hàn Quốc', CAST(N'2025-02-15' AS Date), CAST(N'2026-08-15' AS Date), N'Tiêm bắp', N'MotherCare Flu', 145000, 215000, N'/Uploads/Vaccine/5a79eb08-ae80-4bac-b2d7-2c5d182a164c.png', N'MotherCare Flu là vắc-xin dành riêng cho phụ nữ mang thai, đảm bảo an toàn cả mẹ và thai nhi. Được phát triển tại Hàn Quốc với công nghệ sinh học hiện đại, vắc-xin này không chỉ bảo vệ mẹ khỏi bệnh cúm mùa mà còn giúp tạo miễn dịch thụ động cho trẻ sơ sinh thông qua nhau thai.', 1, 30, 1, N'VT000001')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000064', N'Không', N'Trẻ em từ 1 đến 5 tuổi', 1, N'Canada', CAST(N'2025-03-01' AS Date), CAST(N'2026-09-20' AS Date), N'Tiêm bắp', N'Junior FluGuard', 130000, 200000, N'/Uploads/Vaccine/17ccbb81-fc62-4b2c-826a-92ff3919db05.png', N'Junior FluGuard là vắc-xin dành cho trẻ em nhỏ tuổi với công thức được tối ưu hóa để ngăn ngừa hai chủng cúm A và hai chủng cúm B. Với khả năng kích thích sản xuất kháng thể mạnh mẽ nhưng vẫn giữ mức an toàn cao, Junior FluGuard đã được tổ chức Y tế Thế giới khuyến nghị sử dụng trong chương trình tiêm chủng mở rộng.', 1, 60, 1, N'VT000001')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000065', N'Dị ứng nặng với protein động vật', N'Người cao tuổi từ 60 tuổi trở lên', 1, N'Anh', CAST(N'2025-04-01' AS Date), CAST(N'2026-10-10' AS Date), N'Tiêm bắp', N'ElderFlu Advanced', 155000, 225000, N'/Uploads/Vaccine/6c6f89e9-15db-4692-9358-532ec2558778.png', N'ElderFlu Advanced là vắc-xin được thiết kế riêng cho người cao tuổi, những người có nguy cơ cao bị biến chứng nặng khi nhiễm cúm. Với công thức đặc biệt, vắc-xin này không chỉ tăng cường miễn dịch mà còn giảm thiểu nguy cơ phản ứng phụ thường gặp ở người lớn tuổi. ElderFlu Advanced đã nhận được nhiều giải thưởng quốc tế về chất lượng và hiệu quả.', 1, 45, 1, N'VT000001')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000066', N'Dị ứng với kháng sinh', N'Người lớn từ 18 đến 50 tuổi', 1, N'Canada', CAST(N'2025-01-01' AS Date), CAST(N'2026-06-30' AS Date), N'Tiêm bắp', N'PneumoCare Pro', 145000, 210000, N'/Uploads/Vaccine/411e25f7-5f8c-4070-96e9-9e82eac619f7.png', N'PneumoCare Pro là vắc-xin cao cấp giúp ngăn ngừa các bệnh nguy hiểm do vi khuẩn Streptococcus pneumoniae gây ra như viêm phổi, viêm màng não và nhiễm trùng máu. Vắc-xin này được khuyến nghị sử dụng cho người trưởng thành có nguy cơ cao, đảm bảo hiệu quả và độ an toàn tối ưu.', 1, 30, 1, N'VT000002')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000067', N'Dị ứng với latex', N'Trẻ em từ 1 đến 3 tuổi', 1, N'Úc', CAST(N'2025-02-01' AS Date), CAST(N'2026-07-31' AS Date), N'Tiêm dưới da', N'PneumoJunior', 135000, 195000, N'/Uploads/Vaccine/9d49c709-a0e7-4478-8d0b-13b0c0c9fd2d.png', N'PneumoJunior là dòng vắc-xin chuyên biệt cho trẻ nhỏ, bảo vệ toàn diện trước các chủng vi khuẩn Streptococcus pneumoniae phổ biến. Công thức tiên tiến giúp tăng cường miễn dịch mà vẫn an toàn tuyệt đối cho trẻ nhỏ.', 1, 25, 1, N'VT000002')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000068', N'Dị ứng với protein động vật', N'Người cao tuổi từ 60 tuổi trở lên', 2, N'Mỹ', CAST(N'2025-03-15' AS Date), CAST(N'2026-09-15' AS Date), N'Tiêm bắp', N'SeniorPneumo Plus', 155000, 225000, N'/Uploads/Vaccine/f59bb1ea-9350-4029-b419-1eaae5832be4.png', N'SeniorPneumo Plus là vắc-xin dành riêng cho người cao tuổi, giúp ngăn ngừa các bệnh nhiễm khuẩn nghiêm trọng do Streptococcus pneumoniae. Sản phẩm đã được chứng minh hiệu quả trong việc giảm tỷ lệ nhập viện và tử vong do viêm phổi.', 2, 60, 1, N'VT000002')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000069', N'Không', N'Phụ nữ sau sinh', 1, N'Anh', CAST(N'2025-04-01' AS Date), CAST(N'2026-10-10' AS Date), N'Tiêm bắp', N'PneumoMom', 140000, 210000, N'/Uploads/Vaccine/74ee5d51-714d-4eac-ad8f-871f8c0bdc3d.png', N'PneumoMom là vắc-xin được thiết kế đặc biệt cho phụ nữ sau sinh nhằm bảo vệ họ khỏi các bệnh nhiễm khuẩn nguy hiểm. Ngoài việc tạo miễn dịch cá nhân, vắc-xin này còn giảm nguy cơ lây nhiễm vi khuẩn cho trẻ sơ sinh và các thành viên trong gia đình.', 1, 40, 1, N'VT000002')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000070', N'Dị ứng nặng với thuốc kháng sinh', N'Người trưởng thành có bệnh lý nền', 1, N'Đức', CAST(N'2025-05-01' AS Date), CAST(N'2026-12-01' AS Date), N'Tiêm dưới da', N'PneumoDefender', 150000, 220000, N'/Uploads/Vaccine/247dbcbc-814f-4cba-8789-b799f533669b.png', N'PneumoDefender là vắc-xin tiên tiến giúp bảo vệ người trưởng thành có bệnh lý nền như tiểu đường, cao huyết áp và bệnh phổi mãn tính khỏi các biến chứng nguy hiểm do Streptococcus pneumoniae. Công nghệ sản xuất hiện đại giúp tăng hiệu quả và giảm thiểu tác dụng phụ.', 1, 50, 1, N'VT000002')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000071', N'Dị ứng nặng với kháng sinh', N'Người lớn từ 18-45 tuổi', 1, N'Mỹ', CAST(N'2025-01-01' AS Date), CAST(N'2026-01-15' AS Date), N'Tiêm bắp', N'PneumoShield Adult', 140000, 210000, N'/Uploads/Vaccine/39738eae-cf7e-4f06-8785-7be4db2ea62e.png', N'PneumoShield Adult là vắc-xin hiệu quả dành cho người lớn từ 18-45 tuổi, giúp ngăn ngừa các bệnh liên quan đến Streptococcus pneumoniae, bao gồm viêm phổi và viêm màng não.', 1, 30, 1, N'VT000003')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000072', N'Không', N'Trẻ em từ 2-6 tuổi', 1, N'Canada', CAST(N'2025-02-01' AS Date), CAST(N'2026-02-28' AS Date), N'Tiêm bắp', N'PneumoJunior Pro', 125000, 190000, N'/Uploads/Vaccine/da810936-592c-487c-95b6-7c019e34a6d8.png', N'PneumoJunior Pro được thiết kế đặc biệt cho trẻ nhỏ, giúp bảo vệ toàn diện trước các chủng vi khuẩn Streptococcus pneumoniae phổ biến. Vắc-xin này được khuyến nghị trong các chương trình tiêm chủng mở rộng.', 1, 20, 1, N'VT000003')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000073', N'Dị ứng với protein động vật', N'Người cao tuổi trên 65 tuổi', 2, N'Úc', CAST(N'2025-03-01' AS Date), CAST(N'2026-03-20' AS Date), N'Tiêm dưới da', N'SeniorPneumo Guard', 160000, 240000, N'/Uploads/Vaccine/36f1b297-f4e3-4dce-bf71-e22979a10e1b.png', N'SeniorPneumo Guard là vắc-xin chuyên biệt dành cho người cao tuổi, giúp giảm nguy cơ biến chứng nặng từ các bệnh do vi khuẩn Streptococcus pneumoniae.', 2, 60, 1, N'VT000003')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000074', N'Không', N'Phụ nữ sau sinh trong vòng 6 tháng', 1, N'Pháp', CAST(N'2025-04-01' AS Date), CAST(N'2026-04-20' AS Date), N'Tiêm bắp', N'PneumoMom Protect', 135000, 200000, N'/Uploads/Vaccine/31e8a4a6-2f93-4405-8b98-da9110bff06d.png', N'PneumoMom Protect là vắc-xin lý tưởng cho phụ nữ sau sinh, giúp bảo vệ sức khỏe mẹ và giảm nguy cơ lây nhiễm vi khuẩn cho trẻ nhỏ.', 1, 40, 1, N'VT000003')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000075', N'Dị ứng với latex', N'Người trưởng thành mắc bệnh mãn tính', 1, N'Đức', CAST(N'2025-05-01' AS Date), CAST(N'2026-05-30' AS Date), N'Tiêm dưới da', N'PneumoChronic Care', 145000, 215000, N'/Uploads/Vaccine/e35cd4dc-3819-4789-95fa-f2b117dc817f.png', N'PneumoChronic Care là vắc-xin giúp bảo vệ những người mắc các bệnh mãn tính như tiểu đường, bệnh phổi mãn tính và các vấn đề về tim mạch khỏi các bệnh liên quan đến Streptococcus pneumoniae.', 1, 30, 1, N'VT000003')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000076', N'Không', N'Trẻ em dưới 1 tuổi', 3, N'Nhật Bản', CAST(N'2025-06-01' AS Date), CAST(N'2026-06-15' AS Date), N'Tiêm bắp', N'PneumoBaby Guard', 120000, 180000, N'/Uploads/Vaccine/771b65cd-5d88-447d-8be3-625ac8ddab3f.png', N'PneumoBaby Guard là dòng vắc-xin tiên tiến giúp bảo vệ trẻ sơ sinh khỏi các bệnh nguy hiểm do vi khuẩn Streptococcus pneumoniae.', 3, 50, 1, N'VT000003')
INSERT [dbo].[Vaccines] ([Id], [Contraindication], [Indication], [Number_Of_Injection], [Origin], [Time_Begin_Next_Injection], [Time_End_Next_Injection], [Usage], [Vaccine_Name], [Purchase_Price], [Selling_Price], [Image], [Description], [Required_Injections], [Time_Between_Injections], [Status], [Vaccine_Type_Id]) VALUES (N'VC000077', N'Dị ứng gelatin', N'Người trưởng thành từ 50 tuổi trở lên', 2, N'Hàn Quốc', CAST(N'2025-07-01' AS Date), CAST(N'2026-07-20' AS Date), N'Tiêm bắp', N'PneumoProtect 50+', 155000, 230000, N'/Uploads/Vaccine/0af7450e-63ff-44d7-8706-87911415370d.png', N'PneumoProtect 50+ là vắc-xin đặc biệt dành cho người trưởng thành trên 50 tuổi, giúp giảm nguy cơ mắc viêm phổi và các bệnh do vi khuẩn Streptococcus pneumoniae.', 2, 60, 1, N'VT000003')

select * from Vaccines

INSERT INTO Distributions(Id, Vaccine_Id, Place_Id, Date_Import, Quantity_Imported, Quantity_Injected)
VALUES
('DS000001', 'VC000001', 'PL000001', '2024-01-15', 95, 5), 
('DS000002', 'VC000002', 'PL000002', '2024-02-15', 80, 5), 
('DS000003', 'VC000003', 'PL000003', '2024-03-10', 60, 5),
('DS000004', 'VC000004', 'PL000004', '2024-04-20', 70, 5),
('DS000005', 'VC000005', 'PL000005', '2024-05-25', 50, 0),
('DS000006', 'VC000001', 'PL000006', '2024-01-20', 90, 5),
('DS000007', 'VC000002', 'PL000007', '2024-07-18', 85, 0),
('DS000008', 'VC000003', 'PL000008', '2025-08-15', 65, 0),
('DS000009', 'VC000004', 'PL000009', '2024-10-22', 75, 0),
('DS000010', 'VC000005', 'PL000010', '2024-10-28', 55, 0),
('DS000011', 'VC000001', 'PL000001', '2024-01-25', 95, 0),
('DS000012', 'VC000002', 'PL000002', '2024-11-20', 80, 5),
('DS000013', 'VC000003', 'PL000003', '2024-12-20', 60, 5),
('DS000014', 'VC000004', 'PL000004', '2024-08-25', 70, 5),
('DS000015', 'VC000005', 'PL000005', '2024-10-30', 50, 5),
('DS000016', 'VC000001', 'PL000006', '2024-09-30', 90, 5),
('DS000017', 'VC000002', 'PL000007', '2024-02-22', 85, 0),
('DS000018', 'VC000003', 'PL000008', '2024-05-25', 65, 0),
('DS000019', 'VC000004', 'PL000009', '2024-11-28', 75, 0),
('DS000020', 'VC000005', 'PL000010', '2024-05-15', 55, 0),
('DS000021', 'VC000006', 'PL000001', '2024-06-05', 90, 5),
('DS000022', 'VC000007', 'PL000002', '2024-07-15', 85, 0),
('DS000023', 'VC000008', 'PL000003', '2025-08-10', 100, 5),
('DS000024', 'VC000009', 'PL000004', '2024-09-10', 60, 5),
('DS000025', 'VC000010', 'PL000005', '2026-10-20', 70, 5),
('DS000026', 'VC000011', 'PL000006', '2025-01-05', 95, 0),
('DS000027', 'VC000012', 'PL000007', '2024-11-10', 55, 5),
('DS000028', 'VC000013', 'PL000008', '2024-12-15', 75, 0),
('DS000029', 'VC000014', 'PL000009', '2024-08-05', 65, 5),
('DS000030', 'VC000015', 'PL000010', '2024-10-20', 80, 5),
('DS000031', 'VC000016', 'PL000001', '2024-09-05', 70, 0),
('DS000032', 'VC000017', 'PL000002', '2025-02-15', 95, 5),
('DS000033', 'VC000018', 'PL000003', '2024-05-10', 90, 5),
('DS000034', 'VC000019', 'PL000004', '2024-11-15', 60, 0),
('DS000035', 'VC000020', 'PL000005', '2026-03-05', 85, 5),
('DS000036', 'VC000021', 'PL000006', '2024-01-10', 65, 0),
('DS000037', 'VC000022', 'PL000007', '2024-02-05', 75, 5),
('DS000038', 'VC000023', 'PL000008', '2024-03-05', 80, 5),
('DS000039', 'VC000024', 'PL000009', '2024-04-05', 60, 0),
('DS000040', 'VC000025', 'PL000010', '2024-05-05', 70, 5),
('DS000041', 'VC000026', 'PL000001', '2025-01-10', 85, 0),
('DS000042', 'VC000027', 'PL000002', '2025-03-10', 90, 5),
('DS000043', 'VC000028', 'PL000003', '2025-05-10', 60, 5),
('DS000044', 'VC000029', 'PL000004', '2025-07-10', 55, 0),
('DS000045', 'VC000030', 'PL000005', '2025-09-10', 75, 5),
('DS000046', 'VC000031', 'PL000006', '2025-01-20', 65, 0),
('DS000047', 'VC000032', 'PL000007', '2025-02-10', 95, 5),
('DS000048', 'VC000033', 'PL000008', '2025-03-10', 90, 5),
('DS000049', 'VC000034', 'PL000009', '2025-04-10', 80, 5),
('DS000050', 'VC000035', 'PL000010', '2025-05-10', 55, 0);


select * from Distributions


-- Sample data for Injection_Schedules
INSERT INTO Injection_Schedules (Id, [Description], Start_Date, Place_Id, End_Date, Vaccine_Id) 
VALUES 
('VS000001', 'Initial vaccination schedule', '01-10-2023', 'PL000001', '01-17-2023', 'VC000001'),
('VS000002', 'Follow-up vaccination', '02-15-2023', 'PL000002', '02-22-2023', 'VC000002'),
('VS000003', 'Annual flu shot', '03-05-2023', 'PL000003', '03-12-2023', 'VC000003'),
('VS000004', 'Children vaccination drive', '04-25-2023', 'PL000004', '05-02-2023', 'VC000004'),
('VS000005', 'Booster dose', '05-15-2023', 'PL000005', '05-22-2023', 'VC000005'),
('VS000006', 'Routine checkup and vaccination', '06-10-2023', 'PL000006', '06-17-2023', 'VC000001'),
('VS000007', 'Pre-travel vaccination', '07-20-2023', 'PL000007', '07-27-2023', 'VC000002'),
('VS000008', 'School vaccination program', '08-15-2023', 'PL000008', '08-22-2023', 'VC000003'),
('VS000009', 'Occupational health vaccination', '09-10-2023', 'PL000009', '09-17-2023', 'VC000004'),
('VS000010', 'Seasonal vaccination event', '10-05-2023', 'PL000010', '10-12-2023', 'VC000005'),
('VS000011', 'Community vaccination drive', '2024-01-20', 'PL000001', '2025-01-25', 'VC000001'),
('VS000012', 'Children vaccination program', '2024-02-18', 'PL000002', '2025-02-24', 'VC000002'),
('VS000013', 'Seasonal flu vaccination', '2024-03-12', 'PL000003', '2025-03-18', 'VC000003'),
('VS000014', 'Newcomer health check', '2024-04-22', 'PL000004', '2024-04-29', 'VC000004'),
('VS000015', 'Routine health check', '2024-05-28', 'PL000005', '2024-06-03', 'VC000005'),
('VS000016', 'Employee health program', '2024-06-15', 'PL000006', '2025-06-20', 'VC000006'),
('VS000017', 'Pregnancy care vaccinations', '2024-07-18', 'PL000007', '2025-07-24', 'VC000007'),
('VS000018', 'School vaccination week', '2024-08-20', 'PL000008', '2024-08-26', 'VC000008'),
('VS000019', 'Summer vaccination event', '2024-09-15', 'PL000009', '2024-09-21', 'VC000009'),
('VS000020', 'Village vaccination day', '2024-10-20', 'PL000010', '2024-10-26', 'VC000010'),
('VS000021', 'Winter vaccination drive', '2024-11-05', 'PL000001', '2024-11-10', 'VC000012'),
('VS000022', 'Festival health check', '2024-12-15', 'PL000002', '2024-12-21', 'VC000013'),
('VS000023', 'New year health check', '2024-01-01', 'PL000003', '2024-01-07', 'VC000021'),
('VS000024', 'Pre-school vaccination', '2024-02-15', 'PL000004', '2024-02-20', 'VC000022'),
('VS000025', 'Community flu shots', '2024-03-05', 'PL000005', '2024-03-10', 'VC000023'),
('VS000026', 'Routine vaccination', '2024-04-15', 'PL000006', '2024-04-20', 'VC000024'),
('VS000027', 'Traveler vaccinations', '2024-05-25', 'PL000007', '2024-05-30', 'VC000025'),
('VS000028', 'Annual health check', '2025-01-05', 'PL000008', '2025-01-12', 'VC000026'),
('VS000029', 'Company vaccination day', '2025-03-12', 'PL000009', '2025-03-17', 'VC000027'),
('VS000030', 'Emergency vaccination', '2025-05-18', 'PL000010', '2025-05-24', 'VC000028'),
('VS000031', 'Employee wellness check', '2025-07-15', 'PL000001', '2025-07-20', 'VC000029'),
('VS000032', 'Local vaccination event', '2025-09-10', 'PL000002', '2025-09-15', 'VC000030'),
('VS000033', 'Spring vaccination drive', '2025-01-22', 'PL000003', '2025-01-29', 'VC000031'),
('VS000034', 'Pre-winter vaccinations', '2025-02-15', 'PL000004', '2025-02-22', 'VC000032'),
('VS000035', 'School checkup', '2025-03-22', 'PL000005', '2025-03-29', 'VC000033'),
('VS000036', 'Public health vaccination', '2025-04-15', 'PL000006', '2025-04-22', 'VC000034'),
('VS000037', 'Health awareness week', '2025-05-10', 'PL000007', '2025-05-17', 'VC000035'),
('VS000038', 'Family health day', '2025-06-18', 'PL000008', '2025-06-24', 'VC000026'),
('VS000039', 'Pre-holiday vaccinations', '2025-07-10', 'PL000009', '2025-07-16', 'VC000027'),
('VS000040', 'Kids vaccination camp', '2025-08-15', 'PL000010', '2025-08-21', 'VC000028');

select * from Injection_Schedules


-- Sample data for Employees
INSERT INTO Employees(Id, [Address], WardId, DistrictId, ProvinceId, Date_Of_Birth, Email, Gender, [Image], [Password], Place_Id,
Username, Employee_Name, [Role_Id], Phone, [Status], PositionId)
VALUES
('EM000001', '501-3234 Eu Ave.', '30337', '886', '89', '2003/04/14', 'truongvqhe171140@fpt.edu.vn', 1, '', '123', 'PL000005', 'TruongHi', 'Admin', 3, '0912345678', 1, 'PO000001'),
('EM000002', 'P.O. Box 984, 8006 Luctus St.', '30373', '886', '89', '1987/04/18', 'hung080104@gmail.com', 1, '', '123', 'PL000009', 'SheldonD', 'Sheldon Cooper', 3, '0923456789', 1, 'PO000001'),
('EM000003', '2128 Ipsum Avenue', '26572', '748', '77', '1995/03/25', 'dr.amy@yahoo.com', 1, '', '123', 'PL000002', 'AmyCares', 'Amy Farrah Fowler', 2, '0934567890', 1, 'PO000001'),
('EM000004', '390-2471 Gravida Road', '26566', '748', '77', '1992/11/11', 'lily.nurse@gmail.com', 0, '', '123', 'PL000003', 'LilyNurse', 'Lily Aldrin', 2, '0987123456', 0, 'PO000002'),
('EM000005', '5038 Euismod Lane', '26563', '748', '77', '1989/08/19', 'marshall.nurse@gmail.com', 1, '', '123', 'PL000006', 'BigNurseM', 'Marshall Eriksen', 2, '0945123456', 1, 'PO000002'),
('EM000006', '890-3003 Vestibulum St.', '26554', '748', '77', '1993/05/30', 'ted.nursing@gmail.com', 1, '', '123', 'PL000007', 'NurseTed', 'Ted Mosby', 2, '0978123456', 1, 'PO000002'),
('EM000007', '600-9251 Ornare Lane', '07231', '213', '24', '2001/02/20', 'manny.nurse@gmail.com', 0, '', '123', 'PL000008', 'MannyHelper', 'Manny Delgado', 2, '0961234567', 0, 'PO000003'),
('EM000008', '120-3829 Phasellus Ave.', '07441', '213', '24', '1998/06/15', 'haley.nurse@gmail.com', 0, '', '123', 'PL000010', 'HaleySmile', 'Haley Dunphy', 2, '0956781234', 1, 'PO000003'),
('EM000009', '7802 Vulputate Street', '07216', '213', '24', '1999/01/09', 'alex.nurse@gmail.com', 1, '', '123', 'PL000004', 'AlexBright', 'Alex Dunphy', 2, '0946781234', 0, 'PO000003'),
('EM000010', '142-8541 Donec St.', '03359', '100', '11', '1995/12/07', 'luke.babysitter@gmail.com', 1, '', '123', 'PL000008', 'CoolLuke', 'Luke Dunphy', 2, '0934567123', 0, 'PO000004'),
('EM000011', '203-1033 Risus Road', '03364', '100', '11', '2000/09/01', 'phil.babysitter@gmail.com', 1, '', '123', 'PL000005', 'PhilTastic', 'Phil Dunphy', 2, '0923456712', 1, 'PO000004'),
-- pwd: Password001@
('EM000012', '347-6015 Cras Avenue', '02200', '070', '08', '1997/07/20', 'emp.claire@gmail.com', 0, 'http://vincture.csproject.org/depot/thermalPaste.png', '$2a$11$lPxekoIgZW4yNDmOBX65iuQ.uGBHCZPxk.hr3WIOGKr1twq4ofXNe', 'PL000001', 'BossClaire', 'Claire Dunphy', 2, '0912345671', 1, 'PO000004'),
-- pwd: Password001@
('EM000013', '501-3234 Eu Ave.' , '30337', '886', '89', '1990/07/08', 'doctor.clara@gmail.com', 1, 'https://picsum.photos/200', '$2a$11$lPxekoIgZW4yNDmOBX65iuQ.uGBHCZPxk.hr3WIOGKr1twq4ofXNe', 'PL000005', 'DocClara', 'Clara Oswald', 3, '0912345678', 1, 'PO000001');

SELECT * FROM Employees


-- Sample data for Customers
INSERT INTO Customers (Id, Address, [Province], [District], [Ward], Date_Of_Birth, Full_Name, Email, Gender, Phone, Identity_Card, Password, Username, Status, Role_Id)
VALUES 
('CM000001', '123 Main St', '01', '001', '00001', '1990-01-01', 'John Doe', 'johndoe@email.com', 0, '0123456789', 'ID123456789', 'password1', 'johndoe', 1, 1),
('CM000002', '456 Oak St', '01', '001', '00001', '1985-05-15', 'Jane Smith', 'janesmith@email.com', 1, '0123456790', 'ID987654321', 'password2', 'janesmith', 1, 1),
('CM000003', '789 Pine St', '01', '001', '00001', '2000-07-20', 'Sam Brown', 'sambrown@email.com', 0, '0123456791', 'ID112233445', 'password3', 'sambrown', 0, 1),
('CM000004', '101 Maple St', '01', '001', '00001', '1992-11-30', 'Anna White', 'annawhite@email.com', 1, '0123456792', 'ID556677889', 'password4', 'annawhite', 1, 1),
('CM000005', '202 Elm St', '01', '001', '00001', '1995-03-10', 'Mike Green', 'mikegreen@email.com', 0, '0123456793', 'ID998877665', 'password5', 'mikegreen', 1, 1),
('CM000006', '303 Birch St', '01', '001', '00001', '1998-09-22', 'Laura Black', 'laurablack@email.com', 1, '0123456794', 'ID223344556', 'password6', 'laurablack', 0, 1),
('CM000007', '404 Cedar St', '01', '001', '00001', '2002-02-14', 'Chris Grey', 'chrisgrey@email.com', 0, '0123456795', 'ID667788990', 'password7', 'chrisgrey', 1, 1),
('CM000008', '505 Fir St', '01', '001', '00001', '1996-06-28', 'Kelly Blue', 'kellyblue@email.com', 1, '0123456796', 'ID223355667', 'password8', 'kellyblue', 1, 1),
('CM000009', '606 Redwood St', '01', '001', '00001', '1994-12-05', 'David Yellow', 'davidyellow@email.com', 0, '0123456797', 'ID334455778', 'password9', 'davidyellow', 1, 1),
('CM000010', '707 Spruce St', '01', '001', '00001', '2001-08-17', 'Megan Purple', 'meganpurple@email.com', 1, '0123456798', 'ID445566889', 'password10', 'meganpurple', 0, 1),
('CM000011', '808 Redwood St', '01', '001', '00001', '1988-04-25', 'Jack White', 'jackwhite@email.com', 0, '0123456799', 'ID556677990', 'password11', 'jackwhite', 1, 1),
-- pwd: Password001@
('CM000012', '808 Redwood St', '01', '001', '00001', '1988-04-25', N'Jack BLACK (😰)', 'jackblack@email.com', 0, '0123456799', 'ID556677990', '$2a$11$lPxekoIgZW4yNDmOBX65iuQ.uGBHCZPxk.hr3WIOGKr1twq4ofXNe', 'jackblack', 1, 1);

select * from Customers


-- Sample data for Injection_Results
INSERT INTO Injection_Results (Id, Customer_Id, Injection_Date, Injection_Place_Id, Next_Injection_Date, Number_Of_Injection, Prevention, Vaccine_Id, IsVaccinated, Injection_Number) 
VALUES 
('VR000001', 'CM000001', '01-10-2023', 'PL000001', '01-17-2023', 5, 'COVID-19 mRNA Vaccine', 'VC000001', 2, 1),
('VR000002', 'CM000003', '02-15-2023', 'PL000002', '02-22-2023', 6, 'Influenza Vaccine', 'VC000002', 2, 1),
('VR000003', 'CM000001', '03-05-2023', 'PL000003', '03-12-2023', 7, 'COVID-19 Protein Subunit Vaccine', 'VC000003', 2, 1),
('VR000004', 'CM000002', '04-25-2023', 'PL000004', '05-02-2023', 5, 'Viral Vector Vaccine', 'VC000004', 2, 1),
('VR000005', 'CM000001', '05-15-2023', 'PL000005', '05-22-2023', 8, 'Inactivated Virus Vaccine', 'VC000005', 2, 1),
('VR000006', 'CM000002', '06-10-2023', 'PL000006', '06-17-2023', 6, 'COVID-19 mRNA Vaccine', 'VC000001', 2, 1),
('VR000007', 'CM000001', '07-20-2023', 'PL000007', '07-27-2023', 7, 'Influenza Vaccine', 'VC000002', 2, 1),
('VR000008', 'CM000002', '08-15-2023', 'PL000008', '08-22-2023', 5, 'COVID-19 Protein Subunit Vaccine', 'VC000003', 2, 1),
('VR000009', 'CM000003', '09-10-2023', 'PL000009', '09-17-2023', 9, 'Viral Vector Vaccine', 'VC000004', 2, 1),
('VR000010', 'CM000002', '10-05-2023', 'PL000010', '10-12-2023', 8, 'Inactivated Virus Vaccine', 'VC000005', 2, 1),
('VR000011', 'CM000001', '11-20-2023', 'PL000010', '11-27-2023', 6, 'COVID-19 mRNA Vaccine', 'VC000001', 2, 1),
('VR000012', 'CM000001', '12-10-2023', 'PL000010', '12-17-2023', 7, 'Influenza Vaccine', 'VC000002', 2, 1);

select * from Injection_Results

GO

-- CREATE PROCEDURE UpdateVaccineStatusCheckTime
-- AS
-- BEGIN
--     UPDATE Vaccines
--     SET Status = 0
--     WHERE Time_End_Next_Injection < CAST(GETDATE() AS DATE)
--       AND Status = 1; 
-- END;
