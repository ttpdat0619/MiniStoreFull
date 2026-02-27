create database ChickenStore;

use chickenstore;

##########
# Group for user
##########

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
		UserID varchar(200) primary key, #Using UUIDv7
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
    Quantity decimal (18,2) default 0
);

Create Table Inventories
(
	InvetoryID varchar(200) primary key,
    ItemID varchar(200), foreign key (ItemID) references Items (ItemID),
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
    CraeteAt datetime default current_timestamp,
    TotalCost decimal (18, 2),
    RejectionReason text
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
    CreateAt datetime default current_timestamp,
    Reason text
);

#Detaill in Wastage form
Create Table WastageDetails
(
	DetailID varchar(200) primary key,
    WastageID varchar(200), foreign key (WastageID) references WastageRequests (WastageID),
    ItemID varchar(200), foreign key (ItemID) references Items (ItemID),
    Quantity decimal (18,2),
    WastageReason text
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

#Table for Orders
Create Table Orders
(
	OrderID varchar(200) primary key,
    CustomerID varchar(200), foreign key (CustomerID) references Users (UserID),
    TicketCouponID varchar(200), foreign key (TicketCouponID) references Coupons (CouponID),
    StatusID varchar(200), foreign key (StatusID) references StatusOrders (StatusID),
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

