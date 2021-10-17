import FeaturedMessage from "./UI/BigComponents/FeaturedMessage";
import Combine from "./UI/Base/Combine";

new FeaturedMessage().AttachTo("maindiv")
new Combine(FeaturedMessage.WelcomeMessages().map(wm => FeaturedMessage.CreateFeaturedBox(wm))).AttachTo("extradiv")