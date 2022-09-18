import MinimapImplementation from "./UI/Base/MinimapImplementation";
import {PdfExportGui} from "./UI/BigComponents/PdfExportGui";

MinimapImplementation.initialize()

new PdfExportGui("extradiv").AttachTo("maindiv")
