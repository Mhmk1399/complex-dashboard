// --------------------------------- Add Product Settings Type ---------------------------------

export interface ProductSettings {
  type: string;
  blocks: {
    images: {
      imageSrc: string;
      imageAlt: string;
    };
    properties: {
      name: string;
      value: string;
    }[];
    colors: {
      code: string;
      quantity: string;
    }[];

    name: string;
    description: string;
    category: { _id: string; name: string };
    price: string;
    status: string;
    discount: string;
    id: string;
  };
}

// --------------------------------- Inventory Type ---------------------------------

export interface Product {
  images: {
    imageSrc: string;
    imageAlt: string;
  };
  _id: string;
  name: string;
  description: string;
  category: { _id: string; name: string };
  price: string;
  status: string;
  discount: string;
  storeId: string;
  properties: {
    name: string;
    value: string;
  }[];
  colors: {
    code: string;
    quantity: string;
  }[];
}
export interface InventoryProps {
  setSelectedMenu: React.Dispatch<React.SetStateAction<string>>;
}

// --------------------------------- Edit Story Type ---------------------------------

export interface Story {
  _id: string;
  title: string;
  image: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EditStoryProps {
  isOpen: boolean;
  onClose: () => void;
}

// --------------------------------- Add Story Type ---------------------------------
export interface StorySettings {
  title: string;
  image: string;
}

//  --------------------------------- Edit Category Type ---------------------------------
export interface Category {
  _id: string;
  name: string;
  children: string[];
  storeId: string;
}

// --------------------------------- ImageSelector Type ---------------------------------

export interface ImageFile {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  storeId: string;
}
export interface ImageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (image: ImageFile) => void;
}

// // --------------------------------- Collection Type ---------------------------------
export interface Collection {
  _id: string;
  name: string;
  products: ProductCollection[]; // Changed from string[] to Product[]
  createdAt: string;
  updatedAt: string;
}

export interface ProductCollection {
  images?: ProductImages;
  _id: string;
  imageSrc?: string;
  imageAlt?: string;
  name: string;
  description: string;
  category: { name: string; _id: string };
  price: string;
  status: string;
  discount: string;
  id: string;
  innventory: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  storeId: string;
}
export interface ProductImages {
  imageSrc: string;
  imageAlt: string;
}
export interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (collection: {
    name: string;
    products: ProductCollection[];
    storeId: string;
    description: string;
  }) => void;
}

// --------------------------------- Form.tsx Type ---------------------------------

export interface FormProps {
  setSelectedMenu: React.Dispatch<React.SetStateAction<string>>;
}
export interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  icon?: React.ReactNode; // Optional icon prop
}

// --------------------------------- Edit Product Type ---------------------------------
export interface EditModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

// --------------------------------- Enamd Type ---------------------------------

export interface EnamadSettings {
  link: string;
  tag: string;
  _id?: string;
}

// --------------------------------- Order Type ---------------------------------

export interface Order {
  _id: string;
  userId: string;
  storeId: string;
  postCode?: string;
  products: {
    productId: string;
    quantity: number;
    price: number;
    _id: string;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  status: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

// --------------------------------- Edit Collection Type ---------------------------------

export interface EditCollectionModalProps {
  collection: Collection;
  isOpen: boolean;
  onClose: () => void;
  fetchCollections: () => void;
}

// --------------------------------- User Type ---------------------------------
export interface User {
  _id: string;
  name: string;
  storeId: string;
  phone: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

// --------------------------------- Delete Modal Type ---------------------------------

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// --------------------------------- Edit Blog Type ---------------------------------
export interface Blog {
  _id: string;
  title: string;
  content: string;
  description: string;
  seoTitle: string;
}

// --------------------------------- Edit File Type ---------------------------------
export interface ImageFile {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

// --------------------------------- Edit File Modal Type ---------------------------------
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
