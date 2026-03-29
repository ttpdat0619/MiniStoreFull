create database ChickenStore;

use chickenstore;

##########
# Group for user
##########

CREATE TABLE Branches (
    BranchID varchar(200) PRIMARY KEY, #Using UUIDv7
    BranchName varchar(200),
    Address varchar(555)
);

#Table Roles
Create Table Roles
(
	RoleID varchar(200) primary key,
    RoleName varchar(100),
    Description varchar(255)
);

#Table User
Create Table Users
(
		UserID varchar(200) primary key, #Using UUIDv7,
        BranchID varchar(200), foreign key (BranchID) references Branches,
        Username varchar(50),
        PhoneNumber varchar(20),
        PasswordHash varchar(555),
        RoleID varchar(200), Foreign Key (RoleID) References Roles (RoleID),
        IsActive bit default 1,
        CreateAt datetime default current_timestamp
);


#Table Profile for User
Create Table UserProfiles
(
	ProfileID varchar(200) primary key, #Using UUIDv7
    UserID varchar(200), foreign key (UserID) references Users (UserID),
    FirstName varchar(50),
    LastName varchar(50),
    Email varchar(200),
    Address varchar(555)
);

##########
# Inventory Manager
##########



#Table Units
Create Table Units
(
	UnitID varchar(200) primary key, #Using UUIDv7
    UnitName varchar(100)
);

#Table Items
Create Table Items
(
	ItemID varchar(200) primary key,
    ItemName varchar(200),	
    UnitID varchar(200), foreign key (UnitID) references Units (UnitID),
    Quantity decimal (18,2) default 0,
    Description varchar(200)
);

Create Table Inventories
(
	InventoryID varchar(200) primary key,
    ItemID varchar(200), foreign key (ItemID) references Items (ItemID),
    BranchID varchar(200), foreign key (BranchID) references Braches (BranchID),
    InventoryName varchar(200),
    StockQuantity decimal(18, 2) default 0,
    MinQuantity decimal (18, 2) default 0,
    LastUpdatedAt datetime default current_timestamp on update current_timestamp
);

#Table to define Import Status
Create Table ImportStatus
(
	StatusID varchar(200) primary key,
    StatusName varchar(200)
);

#Table Goods Receipt Form. Yêu cầu nhập hàng được yêu cầu từ Manager gửi đi đến Admin hoặc Kế toán để duyệt nhập hàng,
#Sau khi Kế toán/Admin đã duyệt thì mới cộng hàng kho
Create Table PurchaseRequests
(
	RequestID varchar(200) primary key,
    ManagerID varchar(200), foreign key (ManagerID) references Users (UserID),
    ApproverID varchar(200), foreign key (ApproverID) references Users (UserID),
    StatusID varchar(200), foreign key (StatusID) references ImportStatus (StatusID),
    BranchID varchar(200), foreign key (BranchID) references Branches (BranchID),
    CreateAt datetime default current_timestamp,
    TotalCost decimal (18, 2),
    RejectionReason text,
    ApprovalDate datetime default current_timestamp
);

#Detail of ingredients in the input form
Create Table PurchaseDetails
(
	DetailID varchar(200) primary key,
    RequestID varchar(200), foreign key (RequestID) references PurchaseRequests (RequestID),
    ItemID varchar(200), foreign key (ItemID) references Items (ItemID),
    Quantity decimal(18,2),
    Price decimal (18,2)
);

#WASTER FORM
Create Table WastageRequests
(
	WastageID varchar(200) primary key,
    RequesterID varchar(200), foreign key (RequesterID) references Users (UserID),
    ApproverID varchar(200), foreign key (ApproverID) references Users(UserID),
    StatusID varchar(200), foreign key (StatusID) references ImportStatus (StatusID),
    BranchID varchar(200), foreign key (BranchID) references Branches (BranchID),
    CreateAt datetime default current_timestamp,
    Reason text,
    ApprovalDate datetime default current_timestamp
);

#Detaill in Wastage form
Create Table WastageDetails
(
	DetailID varchar(200) primary key,
    WastageID varchar(200), foreign key (WastageID) references WastageRequests (WastageID),
    ItemID varchar(200), foreign key (ItemID) references Items (ItemID),
    Quantity decimal (18,2),
    WastageReason text,
    WastagePicture varchar(555)
);

#Internal Transfers
Create Table InternalTransfers
(
	TransferID varchar(200) primary key, #Using UUIDv7
    FromBranchID varchar(200), foreign key (FromBranchID) references Branches (BranchID),
    ToBranchID varchar(200), foreign key (ToBranchID) references Branches (BranchID),
    SenderID varchar(200), foreign key (SenderID) references Users (UserID),
    ReceiverID varchar(200), foreign key (ReceiverID) references Users (UserID),
    ApproverID varchar(200), foreign key (ApproverID) references Users(UserID),
    ReceivingStatus varchar(200), foreign key (ReceivingStatus) references ImportStatus (StatusID),
    ApproveStatus varchar(200), foreign key (ApproveStatus) references ImportStatus (StatusID),
    SentDate datetime DEFAULT CURRENT_TIMESTAMP,
    ReceivedDate datetime,
    ApprovedDate datetime,
    SendNote text,
    ReceivedNote text,
    AdminNote text
);

#Table to get Detail of Transfers
Create Table TransferDetails
(
	DetailID varchar(200) primary key,
    TransferID varchar(200), foreign key (TransferID) references InternalTransfers (TransferID),
    ItemID varchar(200), foreign key (ItemID) references Items(ItemID),
    Quantity decimal(18, 2)
);

##########
# Menu and Formula
##########

#Table to detifine Categories
Create Table Categories
(
	CategoryID varchar(200) primary key,
    CategoryName varchar(200)
);

#table to define Side dish
Create Table FoodItems
(
	FoodID varchar(200) primary key,
    FoodName varchar(200),
    CategoryID varchar(200), foreign key (CategoryID) references Categories (CategoryID),
    BasePrice decimal(18, 2),
    IsAvilable bit default 1,
    ImageURL varchar(555)
);

#Table Formula: Items that make up the dish
Create Table Formulas
(
	FormulaID varchar(200) primary key,
    FoodID varchar(200), foreign key (FoodID) references FoodItems (FoodID),
    ItemID varchar(200), foreign key (ItemID) references Items (ItemID),
    QuantityUsed decimal(18, 2)
);

CREATE TABLE FoodOptions (
	OptionID VARCHAR(200) PRIMARY KEY,
	OptionName VARCHAR(200), -- VD: Xốt mắm tỏi, Xốt cay, Xốt phô mai
	ExtraPrice DECIMAL(18, 2) DEFAULT 0, -- Giá cộng thêm nếu có (VD: +5000đ)
    QuantityUsed decimal (18,2),
	ItemID VARCHAR(200), -- Liên kết tới bảng Items để trừ kho nguyên liệu xốt
	FOREIGN KEY (ItemID) REFERENCES Items(ItemID)
);

CREATE TABLE FoodItem_Options (
    FoodID VARCHAR(200),
    OptionID VARCHAR(200),
    PRIMARY KEY (FoodID, OptionID),
    FOREIGN KEY (FoodID) REFERENCES FoodItems(FoodID),
    FOREIGN KEY (OptionID) REFERENCES FoodOptions(OptionID)
);

CREATE TABLE PackagingRules (
    RuleID varchar(200) primary key,
    FoodID varchar(200),     -- Mì ý hoặc Gà
    ItemID varchar(200),     -- ID của cái Hộp hoặc Giấy gói
    MinQuantity int,         -- Số lượng món khách mua từ...
    MaxQuantity int,         -- ...đến
    PackQuantity decimal(18, 2), -- Số lượng bao bì sẽ bị trừ thực tế
    FOREIGN KEY (FoodID) REFERENCES FoodItems(FoodID),
    FOREIGN KEY (ItemID) REFERENCES Items(ItemID)
);

#Table define combo and food item in this combo
Create Table Combos
(
	ComboID varchar(200) primary key,
    ComboName varchar(200),
    Description text,
    IsAvailable bit default 1,
    ImageURL varchar(555)
);

#Table Detail combo
Create Table ComboDetails
(
	DetailID varchar(200) primary key,
    ComboID varchar(200), foreign key (ComboID) references Combos (ComboID),
    FoodID varchar(200), foreign key (FoodID) references FoodItems (FoodID),
    Quantity int
);

##########
# Coupon and Order
##########

#table to define Type of Coupon
Create Table CouponTypes
(
	TypeID varchar(200) primary key,
    TypeName varchar(200)
);

#Table to define Coupon
Create Table Coupons
(
	CouponID varchar(200) primary key,
    CouponCode varchar (200),
    TypeID varchar(200), foreign key (TypeID) references CouponTypes (TypeID),
    DiscountValue decimal (18,2),
    IsActive bit default 1
);

#Table to difine status for Order
Create Table StatusOrders
(
	StatusID varchar(200) primary key,
    StatusName varchar(200)
);

#Table to Detifine Type of Order
Create Table OrderTypes
(
	TypeID varchar(200) primary key,
    TypeName varchar(100),
    Descripion varchar(200)
);

#Table for Orders
Create Table Orders
(
	OrderID varchar(200) primary key,
    CustomerID varchar(200), foreign key (CustomerID) references Users (UserID),
    TicketCouponID varchar(200), foreign key (TicketCouponID) references Coupons (CouponID),
    StatusID varchar(200), foreign key (StatusID) references StatusOrders (StatusID),
    TypeID varchar(200), foreign key (TypeID) references OrderTypes (TypeID),
    BranchID varchar(200), foreign key (BranchID) references Braches (BranchID),
    TotalAmount decimal (18, 2),
    CreateAt datetime default current_timestamp
);

#Table for 1 order - n coupon
Create Table OrderCoupons
(
	OCID varchar(200) primary key,
    OrderID varchar(200), foreign key (OrderID) references Orders (OrderID),
    CouponID varchar(200), foreign key (CouponID) references Coupons (CouponID),
    DiscountAmountApplied decimal (18, 2) #The amount was reduced thanks to this coupon
);

#Tale Detail Order only FoodItem
Create Table OrderDatails
(
	DetailID varchar(200) primary key,
    OrderID varchar(200), foreign key (OrderID) references Orders (OrderID),
    FoodID varchar(200), foreign key (FoodID) references FoodItems (FoodID),
    OptionID varchar(200), foreign key (OptionID) references FoodOptions(OptionID),
    Quantity int,
    UnitPrice decimal (18, 2)
);

##########
#Table to get activity log 
Create Table ActivityLogs
(
	LogID varchar(200) primary key, #Using UUIDv7
    UserID varchar(200), Foreign Key (UserID) References Users (UserID),
    Action varchar(500),
    TargetTable varchar(255),
    TargetID varchar(200),
    TargetName varchar(200),
    TimeStamp datetime default current_timestamp
);

#1 Action can have many Branch
Create Table ActivityLog_Branches
(
	LogID varchar(200),
    BranchID varchar(200),
    RoleInAction varchar(100), -- EX: 'Source', 'Destination', 'Affected'
    PRIMARY KEY (LogID, BranchID),
    FOREIGN KEY (LogID) REFERENCES ActivityLogs (LogID),
    FOREIGN KEY (BranchID) REFERENCES Branches (BranchID)
);